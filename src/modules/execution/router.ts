import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/server';
import { TRPCError } from '@trpc/server';
import * as scheduler from './scheduler';
import * as xp from './xp';
import { scheduleReview } from './spaced-repetition';
import { getQuizForSkill } from '@/lib/seed/quizzes';

export const executionRouter = router({
    // ─── Get today's quest + stats ───────────────────────────────
    getTodayQuest: protectedProcedure.query(async ({ ctx }) => {
        const quest = await scheduler.getTodayQuest(ctx.supabase, ctx.user.id);

        const streak = await xp.calculateStreak(ctx.supabase, ctx.user.id);

        // XP today
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: todayQuests } = await ctx.supabase
            .from('user_quests')
            .select('xp_granted')
            .eq('user_id', ctx.user.id)
            .eq('scheduled_date', todayStr)
            .not('completed_at', 'is', null);

        const xpToday = (todayQuests ?? []).reduce(
            (sum, q) => sum + ((q.xp_granted as number) ?? 0), 0
        );

        // Week progress (Mon–Sun)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
        const mondayStr = monday.toISOString().split('T')[0];

        const { data: weekQuests } = await ctx.supabase
            .from('user_quests')
            .select('id')
            .eq('user_id', ctx.user.id)
            .gte('scheduled_date', mondayStr)
            .not('completed_at', 'is', null);

        const weekProgress = weekQuests?.length ?? 0;

        // Next 3 quests
        const { data: upcoming } = await ctx.supabase
            .from('user_quests')
            .select('*, quests(*)')
            .eq('user_id', ctx.user.id)
            .gt('scheduled_date', todayStr)
            .is('completed_at', null)
            .eq('skipped', false)
            .order('scheduled_date')
            .limit(3);

        // Evaluate and adapt
        const adaptation = await scheduler.evaluateAndAdapt(ctx.supabase, ctx.user.id);

        return {
            quest,
            streakDays: streak.currentStreak,
            longestStreak: streak.longestStreak,
            xpToday,
            weekProgress,
            upcoming: upcoming ?? [],
            adaptation,
        };
    }),

    // ─── Complete quest ──────────────────────────────────────────
    completeQuest: protectedProcedure
        .input(z.object({
            questId: z.string(),
            timeSpentMinutes: z.number().optional(),
            reflection: z.string().min(80, 'Escreva pelo menos 80 caracteres'),
        }))
        .mutation(async ({ ctx, input }) => {
            // Validate word count
            const wordCount = input.reflection.trim().split(/\s+/).length;
            if (wordCount < 10) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Sua reflexão precisa ter pelo menos 10 palavras.',
                });
            }

            // Validate ownership
            const { data: userQuest } = await ctx.supabase
                .from('user_quests')
                .select('*, quests(*)')
                .eq('id', input.questId)
                .eq('user_id', ctx.user.id)
                .is('completed_at', null)
                .single();

            if (!userQuest) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Quest não encontrada' });
            }

            const quest = userQuest.quests as Record<string, unknown>;
            const estimatedMinutes = (quest?.estimated_minutes as number) ?? 25;
            const skillId = quest?.skill_id as string;

            // Calculate XP
            let xpEarned = xp.QUEST_XP(estimatedMinutes);

            // Streak bonus
            const streak = await xp.calculateStreak(ctx.supabase, ctx.user.id);
            if ((streak.currentStreak + 1) % 7 === 0) xpEarned += xp.STREAK_7_XP;
            if ((streak.currentStreak + 1) % 30 === 0) xpEarned += xp.STREAK_30_XP;

            // Update user_quest
            await ctx.supabase
                .from('user_quests')
                .update({
                    completed_at: new Date().toISOString(),
                    xp_granted: xpEarned,
                    time_spent_minutes: input.timeSpentMinutes,
                })
                .eq('id', input.questId);

            // Insert evidence (reflection)
            await ctx.supabase.from('evidences').insert({
                user_id: ctx.user.id,
                skill_id: skillId,
                type: 'reflection',
                reflection: input.reflection,
            });

            // Add XP
            const xpResult = await xp.addXP(
                ctx.supabase, ctx.user.id, skillId, xpEarned
            );

            // Update skill_progress
            await ctx.supabase
                .from('skill_progress')
                .update({
                    status: 'in_progress',
                    last_activity: new Date().toISOString(),
                })
                .eq('user_id', ctx.user.id)
                .eq('skill_id', skillId);

            // Check if all quests for this skill are done
            const { data: totalQuests } = await ctx.supabase
                .from('quests')
                .select('id')
                .eq('skill_id', skillId)
                .eq('active', true)
                .eq('is_review', false);

            const totalIds = (totalQuests ?? []).map((q) => q.id as string);

            const { data: completedQuests } = await ctx.supabase
                .from('user_quests')
                .select('quest_id')
                .eq('user_id', ctx.user.id)
                .in('quest_id', totalIds.length > 0 ? totalIds : ['__none__'])
                .not('completed_at', 'is', null);

            const allDone = totalIds.length > 0 &&
                (completedQuests?.length ?? 0) >= totalIds.length;

            let skillCompleted = false;
            let phaseCompleted = false;

            if (allDone) {
                skillCompleted = true;
                await ctx.supabase
                    .from('skill_progress')
                    .update({ status: 'completed' })
                    .eq('user_id', ctx.user.id)
                    .eq('skill_id', skillId);

                // Add skill completion XP
                await xp.addXP(ctx.supabase, ctx.user.id, skillId, xp.SKILL_COMPLETE_XP);

                // Schedule review
                await scheduleReview(ctx.supabase, ctx.user.id, skillId);

                // Unlock next locked skill in same plan
                const { data: progress } = await ctx.supabase
                    .from('skill_progress')
                    .select('plan_id')
                    .eq('user_id', ctx.user.id)
                    .eq('skill_id', skillId)
                    .single();

                if (progress?.plan_id) {
                    const { data: nextLocked } = await ctx.supabase
                        .from('skill_progress')
                        .select('skill_id')
                        .eq('user_id', ctx.user.id)
                        .eq('plan_id', progress.plan_id)
                        .eq('status', 'locked')
                        .limit(1)
                        .maybeSingle();

                    if (nextLocked) {
                        await ctx.supabase
                            .from('skill_progress')
                            .update({ status: 'available' })
                            .eq('user_id', ctx.user.id)
                            .eq('skill_id', nextLocked.skill_id);
                    }

                    // Check phase completion (all phase skills completed?)
                    const { data: planData } = await ctx.supabase
                        .from('career_plans')
                        .select('phases')
                        .eq('id', progress.plan_id)
                        .single();

                    if (planData?.phases) {
                        const phases = planData.phases as Array<{ skills: Array<{ id: string }> }>;
                        for (const phase of phases) {
                            const phaseSkillIds = phase.skills.map((s) => s.id);
                            if (phaseSkillIds.includes(skillId)) {
                                const { data: phaseProgress } = await ctx.supabase
                                    .from('skill_progress')
                                    .select('status')
                                    .eq('user_id', ctx.user.id)
                                    .in('skill_id', phaseSkillIds);

                                const allPhaseComplete = (phaseProgress ?? []).every(
                                    (p) => p.status === 'completed' || p.status === 'evidenced'
                                );
                                if (allPhaseComplete) {
                                    phaseCompleted = true;
                                    await xp.addXP(ctx.supabase, ctx.user.id, skillId, xp.PHASE_COMPLETE_XP);
                                }
                                break;
                            }
                        }
                    }
                }
            }

            // Track event
            await ctx.supabase.from('events').insert({
                user_id: ctx.user.id,
                event_name: 'QUEST_COMPLETED',
                properties: {
                    skill_id: skillId,
                    xp_earned: xpEarned,
                    streak_days: streak.currentStreak + 1,
                    skill_completed: skillCompleted,
                    phase_completed: phaseCompleted,
                },
            });

            return {
                xpEarned,
                levelUp: xpResult.levelUp,
                newLevel: xpResult.newLevel,
                streakDays: streak.currentStreak + 1,
                skillCompleted,
                phaseCompleted,
            };
        }),

    // ─── Skip quest ──────────────────────────────────────────────
    skipQuest: protectedProcedure
        .input(z.object({
            questId: z.string(),
            reason: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { data: uq } = await ctx.supabase
                .from('user_quests')
                .select('quest_id')
                .eq('id', input.questId)
                .eq('user_id', ctx.user.id)
                .single();

            if (!uq) throw new TRPCError({ code: 'NOT_FOUND' });

            await ctx.supabase
                .from('user_quests')
                .update({ skipped: true, skip_reason: input.reason })
                .eq('id', input.questId);

            // Reschedule for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            await ctx.supabase.from('user_quests').insert({
                user_id: ctx.user.id,
                quest_id: uq.quest_id,
                scheduled_date: tomorrow.toISOString().split('T')[0],
            });

            return { rescheduled: true };
        }),

    // ─── Request skip-ahead quiz ─────────────────────────────────
    requestSkipAhead: protectedProcedure
        .input(z.object({ skillId: z.string() }))
        .query(({ input }) => {
            const questions = getQuizForSkill(input.skillId);
            // Strip correctIndex for client
            return {
                questions: questions.map(({ question, options }) => ({
                    question,
                    options,
                })),
            };
        }),

    // ─── Submit skip-ahead quiz ──────────────────────────────────
    submitSkipQuiz: protectedProcedure
        .input(z.object({
            skillId: z.string(),
            answers: z.array(z.number()),
        }))
        .mutation(async ({ ctx, input }) => {
            const questions = getQuizForSkill(input.skillId);
            let correct = 0;

            for (let i = 0; i < questions.length; i++) {
                if (input.answers[i] === questions[i].correctIndex) correct++;
            }

            const score = correct / questions.length;
            const passed = score >= 0.8;

            let nextSkill: string | null = null;
            if (passed) {
                nextSkill = await scheduler.skipAhead(
                    ctx.supabase, ctx.user.id, input.skillId
                );
            }

            return { passed, score: Math.round(score * 100), nextSkill };
        }),

    // ─── Activate crisis mode ────────────────────────────────────
    activateCrisisMode: protectedProcedure
        .input(z.object({ durationDays: z.number().default(7) }))
        .mutation(async ({ ctx, input }) => {
            await scheduler.activateCrisisMode(
                ctx.supabase, ctx.user.id, input.durationDays
            );

            await ctx.supabase.from('events').insert({
                user_id: ctx.user.id,
                event_name: 'CRISIS_MODE_ACTIVATED',
                properties: { duration_days: input.durationDays },
            });

            return {
                activated: true,
                message: `Modo Crise ativado por ${input.durationDays} dias. Quests reduzidas para 15 minutos.`,
            };
        }),

    // ─── Get skill progress (kept from original) ────────────────
    getSkillProgress: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('skill_progress')
            .select('*, skills(*)')
            .eq('user_id', ctx.user.id);

        if (error) throw error;
        return data;
    }),

    // ─── Submit evidence (kept from original) ────────────────────
    submitEvidence: protectedProcedure
        .input(z.object({
            skill_id: z.string(),
            type: z.enum(['link', 'file', 'github', 'certificate', 'quiz_score', 'reflection']),
            url: z.string().optional(),
            quiz_score: z.number().optional(),
            certificate_name: z.string().optional(),
            platform_id: z.string().optional(),
            completion_date: z.string().optional(),
            reflection: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('evidences')
                .insert({ user_id: ctx.user.id, ...input })
                .select()
                .single();

            if (error) throw error;
            return data;
        }),
});
