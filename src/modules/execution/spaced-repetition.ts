// Spaced Repetition — schedule review quests after skill completion

import type { SupabaseClient } from '@supabase/supabase-js';

function addDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

// ─── scheduleReview ─────────────────────────────────────────────
export async function scheduleReview(
    supabase: SupabaseClient,
    userId: string,
    skillId: string
): Promise<void> {
    // Find review quest for this skill
    const { data: reviewQuest } = await supabase
        .from('quests')
        .select('id')
        .eq('skill_id', skillId)
        .eq('is_review', true)
        .eq('active', true)
        .limit(1)
        .maybeSingle();

    // If no review quest exists, use first quest of the skill
    let questId: string;
    if (reviewQuest) {
        questId = reviewQuest.id as string;
    } else {
        const { data: fallback } = await supabase
            .from('quests')
            .select('id')
            .eq('skill_id', skillId)
            .eq('active', true)
            .limit(1)
            .maybeSingle();

        if (!fallback) return; // No quest available at all
        questId = fallback.id as string;
    }

    // Schedule 3 review sessions: +3, +7, +30 days
    const intervals = [3, 7, 30];

    for (const interval of intervals) {
        await supabase.from('user_quests').insert({
            user_id: userId,
            quest_id: questId,
            scheduled_date: addDays(interval),
            is_review: true,
        });
    }
}

// ─── processReviewResult ────────────────────────────────────────
export async function processReviewResult(
    supabase: SupabaseClient,
    userId: string,
    skillId: string,
    passed: boolean
): Promise<void> {
    // Find review quest
    const { data: reviewQuest } = await supabase
        .from('quests')
        .select('id')
        .eq('skill_id', skillId)
        .eq('is_review', true)
        .eq('active', true)
        .limit(1)
        .maybeSingle();

    if (!reviewQuest) return;

    const questId = reviewQuest.id as string;

    if (passed) {
        // Next review in 30 days
        await supabase.from('user_quests').insert({
            user_id: userId,
            quest_id: questId,
            scheduled_date: addDays(30),
            is_review: true,
        });
    } else {
        // Failed: review tomorrow + 3 days
        await supabase.from('user_quests').insert({
            user_id: userId,
            quest_id: questId,
            scheduled_date: addDays(1),
            is_review: true,
        });
        await supabase.from('user_quests').insert({
            user_id: userId,
            quest_id: questId,
            scheduled_date: addDays(3),
            is_review: true,
        });
    }
}
