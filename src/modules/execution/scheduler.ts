// QuestScheduler — Adaptive scheduling with 5 rules
// Failure is data, not moral judgment. Zero punishment.

import type { SupabaseClient } from '@supabase/supabase-js';

interface UserQuest {
    id: string;
    user_id: string;
    quest_id: string;
    scheduled_date: string;
    completed_at: string | null;
    skipped: boolean;
    is_recovery: boolean;
    is_review: boolean;
}

function today(): string {
    return new Date().toISOString().split('T')[0];
}

function addDays(date: Date | string, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

// ─── scheduleWeek ────────────────────────────────────────────────
export async function scheduleWeek(
    supabase: SupabaseClient,
    userId: string,
    planId: string,
    fromDate: Date
): Promise<UserQuest[]> {
    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('crisis_mode, recovery_mode, daily_hours_available')
        .eq('id', userId)
        .single();

    const crisisMode = profile?.crisis_mode === true;
    const recoveryMode = profile?.recovery_mode === true;

    // Plan phases fetched for future use
    // const { data: plan } = await supabase
    //     .from('career_plans').select('phases').eq('id', planId).single();

    // Get available skills (current phase)
    const { data: availableSkills } = await supabase
        .from('skill_progress')
        .select('skill_id, status')
        .eq('user_id', userId)
        .eq('plan_id', planId)
        .in('status', ['available', 'in_progress']);

    const activeSkillIds = (availableSkills ?? []).map((s) => s.skill_id as string);

    if (activeSkillIds.length === 0) return [];

    // Get quests for active skills
    const { data: questPool } = await supabase
        .from('quests')
        .select('id, skill_id, estimated_minutes, is_review, title')
        .in('skill_id', activeSkillIds)
        .eq('active', true)
        .order('skill_id')
        .order('estimated_minutes');

    // Get already-scheduled/completed quest IDs
    const { data: existingQuests } = await supabase
        .from('user_quests')
        .select('quest_id, completed_at')
        .eq('user_id', userId);

    const completedQuestIds = new Set(
        (existingQuests ?? []).filter((q) => q.completed_at).map((q) => q.quest_id as string)
    );

    const pool = (questPool ?? []).filter((q) => !completedQuestIds.has(q.id as string));

    const created: UserQuest[] = [];

    for (let day = 0; day < 7; day++) {
        const date = addDays(fromDate, day);

        let selectedQuest: typeof pool[0] | undefined;

        if (crisisMode) {
            // Crisis: review quests ≤ 15 min only
            selectedQuest = pool.find(
                (q) => q.is_review === true && (q.estimated_minutes as number) <= 15
            );
        } else if (recoveryMode) {
            // Recovery: any quest ≤ 15 min
            selectedQuest = pool.find((q) => (q.estimated_minutes as number) <= 15);
        } else {
            // Normal: next uncompleted quest
            selectedQuest = pool[0];
        }

        if (!selectedQuest) {
            // Try first quest from any available skill
            selectedQuest = (questPool ?? []).find(
                (q) => !completedQuestIds.has(q.id as string)
            );
        }

        if (!selectedQuest) break;

        const { data: inserted } = await supabase
            .from('user_quests')
            .insert({
                user_id: userId,
                quest_id: selectedQuest.id,
                scheduled_date: date,
                is_recovery: recoveryMode,
                is_review: crisisMode || (selectedQuest.is_review as boolean),
            })
            .select()
            .single();

        if (inserted) created.push(inserted as unknown as UserQuest);

        // Remove from pool so we don't schedule same quest twice
        const idx = pool.findIndex((q) => q.id === selectedQuest!.id);
        if (idx >= 0) pool.splice(idx, 1);
    }

    return created;
}

// ─── getTodayQuest ───────────────────────────────────────────────
export async function getTodayQuest(
    supabase: SupabaseClient,
    userId: string
): Promise<Record<string, unknown> | null> {
    const todayStr = today();

    // 1. Today's uncompleted quest
    const { data: todayQuest } = await supabase
        .from('user_quests')
        .select('*, quests(*, content_resources(*))')
        .eq('user_id', userId)
        .eq('scheduled_date', todayStr)
        .is('completed_at', null)
        .eq('skipped', false)
        .order('created_at')
        .limit(1)
        .maybeSingle();

    if (todayQuest) return todayQuest as Record<string, unknown>;

    // 2. Recent uncompleted from last 3 days
    const threeDaysAgo = addDays(todayStr, -3);
    const { data: recentQuest } = await supabase
        .from('user_quests')
        .select('*, quests(*, content_resources(*))')
        .eq('user_id', userId)
        .gte('scheduled_date', threeDaysAgo)
        .lte('scheduled_date', todayStr)
        .is('completed_at', null)
        .eq('skipped', false)
        .order('scheduled_date', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (recentQuest) return recentQuest as Record<string, unknown>;

    // 3. Schedule new week and return first
    const { data: activePlan } = await supabase
        .from('career_plans')
        .select('id')
        .eq('user_id', userId)
        .not('selected_at', 'is', null)
        .order('selected_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (activePlan) {
        const newQuests = await scheduleWeek(
            supabase,
            userId,
            activePlan.id as string,
            new Date()
        );
        if (newQuests.length > 0) {
            const { data: full } = await supabase
                .from('user_quests')
                .select('*, quests(*, content_resources(*))')
                .eq('id', newQuests[0].id)
                .single();
            return full as Record<string, unknown>;
        }
    }

    return null;
}

// ─── evaluateAndAdapt ────────────────────────────────────────────
export async function evaluateAndAdapt(
    supabase: SupabaseClient,
    userId: string
): Promise<{ action: string; message?: string; skillId?: string }> {
    const todayStr = today();
    const yesterday = addDays(todayStr, -1);
    const twoDaysAgo = addDays(todayStr, -2);

    // Fetch last 10 quests
    const { data: recentQuests } = await supabase
        .from('user_quests')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: false })
        .limit(10);

    const quests = recentQuests ?? [];

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('months_to_goal')
        .eq('id', userId)
        .single();

    // ─ RULE 1: 1-day miss → silent reschedule
    const yesterdayMiss = quests.find(
        (q) => q.scheduled_date === yesterday && !q.completed_at && !q.skipped
    );
    if (yesterdayMiss) {
        await supabase
            .from('user_quests')
            .update({ scheduled_date: todayStr })
            .eq('id', yesterdayMiss.id);
        return { action: 'rescheduled' };
    }

    // ─ RULE 2: 2 consecutive misses → recovery mode
    const miss1 = quests.find(
        (q) => q.scheduled_date === yesterday && !q.completed_at && !q.skipped
    );
    const miss2 = quests.find(
        (q) => q.scheduled_date === twoDaysAgo && !q.completed_at && !q.skipped
    );
    if (miss1 && miss2) {
        await supabase
            .from('profiles')
            .update({ recovery_mode: true })
            .eq('id', userId);

        // Get active plan
        const { data: activePlan } = await supabase
            .from('career_plans')
            .select('id')
            .eq('user_id', userId)
            .not('selected_at', 'is', null)
            .limit(1)
            .maybeSingle();

        if (activePlan) {
            // Schedule 3 recovery days
            const { data: shortQuests } = await supabase
                .from('quests')
                .select('id')
                .lte('estimated_minutes', 15)
                .eq('active', true)
                .limit(3);

            for (let d = 0; d < 3; d++) {
                const q = (shortQuests ?? [])[d % (shortQuests?.length ?? 1)];
                if (q) {
                    await supabase.from('user_quests').insert({
                        user_id: userId,
                        quest_id: q.id,
                        scheduled_date: addDays(todayStr, d),
                        is_recovery: true,
                    });
                }
            }
        }

        return { action: 'recovery_activated', message: 'Modo retomada ativado' };
    }

    // ─ RULE 3: 5+ days inactive → full replan
    const { data: inProgressSkills } = await supabase
        .from('skill_progress')
        .select('last_activity')
        .eq('user_id', userId)
        .eq('status', 'in_progress');

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const longInactive = (inProgressSkills ?? []).some(
        (s) => !s.last_activity || new Date(s.last_activity as string) < fiveDaysAgo
    );

    if (longInactive) {
        // Delete future uncompleted quests
        await supabase
            .from('user_quests')
            .delete()
            .eq('user_id', userId)
            .gt('scheduled_date', todayStr)
            .is('completed_at', null);

        await supabase
            .from('profiles')
            .update({ recovery_mode: false })
            .eq('id', userId);

        const { data: activePlan } = await supabase
            .from('career_plans')
            .select('id')
            .eq('user_id', userId)
            .not('selected_at', 'is', null)
            .limit(1)
            .maybeSingle();

        if (activePlan) {
            await scheduleWeek(supabase, userId, activePlan.id as string, new Date());
        }

        return { action: 'replanned' };
    }

    // ─ RULE 4: Acceleration (>2 quests/day for 3 distinct days)
    const completed = quests.filter((q) => q.completed_at);
    const byDay = new Map<string, number>();
    for (const q of completed) {
        const d = (q.completed_at as string).split('T')[0];
        byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const fastDays = Array.from(byDay.values()).filter((count) => count > 2).length;
    if (fastDays >= 3) {
        // Find current in-progress skill
        const { data: currentSkill } = await supabase
            .from('skill_progress')
            .select('skill_id')
            .eq('user_id', userId)
            .eq('status', 'in_progress')
            .limit(1)
            .maybeSingle();

        if (currentSkill) {
            return { action: 'suggest_skip_ahead', skillId: currentSkill.skill_id as string };
        }
    }

    // ─ RULE 5: Deadline approaching (≤ 30 days)
    const { data: activePlan } = await supabase
        .from('career_plans')
        .select('created_at')
        .eq('user_id', userId)
        .not('selected_at', 'is', null)
        .limit(1)
        .maybeSingle();

    if (activePlan && profile?.months_to_goal) {
        const createdAt = new Date(activePlan.created_at as string);
        const deadline = new Date(createdAt);
        deadline.setMonth(deadline.getMonth() + (profile.months_to_goal as number));
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 30 && daysLeft > 0) {
            // Add portfolio quests
            const { data: portfolioQuests } = await supabase
                .from('quests')
                .select('id')
                .eq('active', true)
                .ilike('title', '%portfólio%')
                .limit(3);

            for (let d = 0; d < (portfolioQuests?.length ?? 0); d++) {
                const q = portfolioQuests![d];
                await supabase.from('user_quests').insert({
                    user_id: userId,
                    quest_id: q.id,
                    scheduled_date: addDays(todayStr, d + 1),
                });
            }

            return { action: 'deadline_approaching' };
        }
    }

    return { action: 'no_change' };
}

// ─── activateCrisisMode ─────────────────────────────────────────
export async function activateCrisisMode(
    supabase: SupabaseClient,
    userId: string,
    durationDays: number = 7
): Promise<void> {
    const todayStr = today();
    const until = addDays(todayStr, durationDays);

    await supabase
        .from('profiles')
        .update({
            crisis_mode: true,
            crisis_mode_until: new Date(until).toISOString(),
        })
        .eq('id', userId);

    // Delete future uncompleted quests
    await supabase
        .from('user_quests')
        .delete()
        .eq('user_id', userId)
        .gt('scheduled_date', todayStr)
        .is('completed_at', null);

    // Schedule review-only quests
    const { data: activePlan } = await supabase
        .from('career_plans')
        .select('id')
        .eq('user_id', userId)
        .not('selected_at', 'is', null)
        .limit(1)
        .maybeSingle();

    if (activePlan) {
        await scheduleWeek(supabase, userId, activePlan.id as string, new Date());
    }
}

// ─── skipAhead ──────────────────────────────────────────────────
export async function skipAhead(
    supabase: SupabaseClient,
    userId: string,
    skillId: string
): Promise<string | null> {
    const todayStr = today();

    // Mark current skill as completed
    await supabase
        .from('skill_progress')
        .update({ status: 'completed', last_activity: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('skill_id', skillId);

    // Find plan
    const { data: progress } = await supabase
        .from('skill_progress')
        .select('plan_id')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .single();

    const planId = progress?.plan_id as string | undefined;

    // Find next locked skill in same plan
    const { data: nextSkill } = await supabase
        .from('skill_progress')
        .select('skill_id')
        .eq('user_id', userId)
        .eq('plan_id', planId ?? '')
        .eq('status', 'locked')
        .limit(1)
        .maybeSingle();

    if (nextSkill) {
        await supabase
            .from('skill_progress')
            .update({ status: 'available' })
            .eq('user_id', userId)
            .eq('skill_id', nextSkill.skill_id);
    }

    // Delete future quests for old skill
    const { data: oldQuests } = await supabase
        .from('quests')
        .select('id')
        .eq('skill_id', skillId);

    const oldQuestIds = (oldQuests ?? []).map((q) => q.id as string);
    if (oldQuestIds.length > 0) {
        await supabase
            .from('user_quests')
            .delete()
            .eq('user_id', userId)
            .in('quest_id', oldQuestIds)
            .gt('scheduled_date', todayStr)
            .is('completed_at', null);
    }

    // Schedule new week
    if (planId) {
        await scheduleWeek(supabase, userId, planId, new Date());
    }

    return (nextSkill?.skill_id as string) ?? null;
}
