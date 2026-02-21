import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/server';
import { generateCareerPlan } from './generator';
import { getRedis } from '@/lib/redis';
import { scheduleDailyQuests } from '@/modules/execution/scheduler';
import { TRPCError } from '@trpc/server';

export const careerRouter = router({
    // ─── Get all active roles with top skills ────────────────────
    getRoles: protectedProcedure.query(async ({ ctx }) => {
        const { data: roles, error } = await ctx.supabase
            .from('roles')
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) throw error;

        // Fetch top 3 skills per role (phase 1)
        const rolesWithSkills = await Promise.all(
            (roles ?? []).map(async (role) => {
                const { data: skills } = await ctx.supabase
                    .from('skills')
                    .select('id, name, level')
                    .eq('role_id', role.id)
                    .eq('level', 'basic')
                    .limit(3);

                return {
                    ...role,
                    topSkills: skills ?? [],
                };
            })
        );

        return rolesWithSkills;
    }),

    // ─── Generate personalized plan ──────────────────────────────
    generatePlan: protectedProcedure
        .input(z.object({ roleId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const plan = await generateCareerPlan(
                ctx.supabase,
                ctx.user.id,
                input.roleId
            );

            // Persist to DB
            const { data: saved, error } = await ctx.supabase
                .from('career_plans')
                .upsert(
                    {
                        user_id: ctx.user.id,
                        role_id: input.roleId,
                        phases: plan.phases,
                        total_weeks: plan.totalWeeks,
                        adherence_percent: plan.adherencePercent,
                        explanation: plan.explanation,
                    },
                    { onConflict: 'user_id,role_id' }
                )
                .select()
                .single();

            // If upsert by composite fails (no unique constraint), just insert
            if (error) {
                const { data: inserted, error: insertErr } = await ctx.supabase
                    .from('career_plans')
                    .insert({
                        user_id: ctx.user.id,
                        role_id: input.roleId,
                        phases: plan.phases,
                        total_weeks: plan.totalWeeks,
                        adherence_percent: plan.adherencePercent,
                        explanation: plan.explanation,
                    })
                    .select()
                    .single();

                if (insertErr) throw insertErr;
                return { ...plan, planId: inserted.id as string };
            }

            return { ...plan, planId: saved.id as string };
        }),

    // ─── Select and activate a plan ──────────────────────────────
    selectPlan: protectedProcedure
        .input(z.object({ planId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Validate ownership
            const { data: plan, error: planErr } = await ctx.supabase
                .from('career_plans')
                .select('*')
                .eq('id', input.planId)
                .single();

            if (planErr || !plan) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
            }
            if (plan.user_id !== ctx.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your plan' });
            }

            // Mark as selected
            await ctx.supabase
                .from('career_plans')
                .update({ selected_at: new Date().toISOString() })
                .eq('id', input.planId);

            // Initialize skill_progress
            const phases = (plan.phases as Array<{ skills: Array<{ id: string }> }>) ?? [];
            const allSkillIds = phases.flatMap((p) => p.skills.map((s) => s.id));

            // Phase 1 skills = available, others = locked
            const phase1Skills = phases[0]?.skills.map((s) => s.id) ?? [];

            for (const skillId of allSkillIds) {
                await ctx.supabase
                    .from('skill_progress')
                    .upsert(
                        {
                            user_id: ctx.user.id,
                            skill_id: skillId,
                            plan_id: input.planId,
                            status: phase1Skills.includes(skillId) ? 'available' : 'locked',
                        },
                        { onConflict: 'user_id,skill_id' }
                    );
            }

            // Schedule first week of quests
            const { data: availableQuests } = await ctx.supabase
                .from('quests')
                .select('id, estimated_minutes, is_review')
                .in('skill_id', phase1Skills)
                .eq('active', true);

            const { data: profile } = await ctx.supabase
                .from('profiles')
                .select('daily_hours_available')
                .eq('id', ctx.user.id)
                .single();

            const dailyMinutes = ((profile?.daily_hours_available as number) ?? 1) * 60;
            const scheduled = scheduleDailyQuests(
                ctx.user.id,
                dailyMinutes,
                (availableQuests ?? []).map((q) => ({
                    id: q.id as string,
                    estimated_minutes: q.estimated_minutes as number,
                    is_review: q.is_review as boolean,
                }))
            );

            // Insert user_quests for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = tomorrow.toISOString().split('T')[0];

            for (const sq of scheduled) {
                await ctx.supabase.from('user_quests').insert({
                    user_id: ctx.user.id,
                    quest_id: sq.questId,
                    scheduled_date: dateStr,
                    is_review: sq.isReview,
                });
            }

            // Track event
            await ctx.supabase.from('events').insert({
                user_id: ctx.user.id,
                event_name: 'PLAN_SELECTED',
                properties: { plan_id: input.planId, role_id: plan.role_id },
            });

            return {
                planId: input.planId,
                firstQuestsCount: scheduled.length,
                scheduledDate: dateStr,
            };
        }),

    // ─── Explain recommendation ──────────────────────────────────
    explainRecommendation: protectedProcedure
        .input(z.object({ resourceTitle: z.string(), skillId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { data: skill } = await ctx.supabase
                .from('skills')
                .select('name')
                .eq('id', input.skillId)
                .single();

            const skillName = (skill?.name as string) ?? input.skillId;

            return {
                explanation: `Recomendamos '${input.resourceTitle}' porque: desenvolve ${skillName}, que está disponível no seu caminho atual, e é completamente gratuito.`,
            };
        }),

    // ─── Invalidate Redis cache ──────────────────────────────────
    invalidateCache: protectedProcedure
        .input(z.object({ roleId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const redis = getRedis();
            if (!redis) return { ok: true };

            const key = `plan:${ctx.user.id}:${input.roleId}`;
            try {
                await redis.del(key);
            } catch {
                // Non-critical
            }
            return { ok: true };
        }),
});
