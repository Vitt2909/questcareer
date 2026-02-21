// XP Service — Always additive. Zero penalty for failure or crisis.

import type { SupabaseClient } from '@supabase/supabase-js';

// ─── XP Constants ───────────────────────────────────────────────
export const QUEST_XP = (minutes: number) => Math.round(minutes * 1.2);
export const EVIDENCE_XP = 150;
export const CERTIFICATE_XP = 300;
export const REFLECTION_XP = 0; // Included in QUEST_XP
export const QUIZ_PASS_XP = 200;
export const SKILL_COMPLETE_XP = 500;
export const PHASE_COMPLETE_XP = 1000;
export const STREAK_7_XP = 100;
export const STREAK_30_XP = 500;

// ─── calculateLevel ─────────────────────────────────────────────
export function calculateLevel(totalXP: number): {
    level: number;
    currentXP: number;
    nextLevelXP: number;
} {
    const level = Math.floor(totalXP / 500) + 1;
    const nextLevelXP = level * 500;
    const currentXP = totalXP % 500;
    return { level, currentXP, nextLevelXP };
}

// ─── calculateStreak ────────────────────────────────────────────
export async function calculateStreak(
    supabase: SupabaseClient,
    userId: string
): Promise<{ currentStreak: number; longestStreak: number }> {
    const { data } = await supabase
        .from('user_quests')
        .select('completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(60);

    if (!data || data.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Group by date
    const datesSet = new Set<string>();
    for (const row of data) {
        const d = (row.completed_at as string).split('T')[0];
        datesSet.add(d);
    }

    const dates = Array.from(datesSet).sort().reverse();

    // Count current streak backwards from today
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let checkDate = todayStr;

    for (let i = 0; i < dates.length; i++) {
        if (dates[i] === checkDate) {
            currentStreak++;
            // Move to previous day
            const d = new Date(checkDate);
            d.setDate(d.getDate() - 1);
            checkDate = d.toISOString().split('T')[0];
        } else if (i === 0 && dates[0] !== todayStr) {
            // Allow yesterday as start of streak (haven't done today yet)
            const yesterdayStr = new Date();
            yesterdayStr.setDate(yesterdayStr.getDate() - 1);
            const yesterday = yesterdayStr.toISOString().split('T')[0];
            if (dates[0] === yesterday) {
                currentStreak = 1;
                const d = new Date(yesterday);
                d.setDate(d.getDate() - 1);
                checkDate = d.toISOString().split('T')[0];
            } else {
                break;
            }
        } else {
            break;
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 1;
    const sortedAsc = Array.from(datesSet).sort();

    for (let i = 1; i < sortedAsc.length; i++) {
        const prev = new Date(sortedAsc[i - 1]);
        const curr = new Date(sortedAsc[i]);
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
            streak++;
        } else {
            longestStreak = Math.max(longestStreak, streak);
            streak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, streak);

    return { currentStreak, longestStreak };
}

// ─── addXP ──────────────────────────────────────────────────────
export async function addXP(
    supabase: SupabaseClient,
    userId: string,
    skillId: string,
    amount: number
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> {
    // Get current XP
    const { data: before } = await supabase
        .from('skill_progress')
        .select('xp_earned')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .single();

    const prevSkillXP = (before?.xp_earned as number) ?? 0;

    // Update skill XP
    await supabase
        .from('skill_progress')
        .update({ xp_earned: prevSkillXP + amount })
        .eq('user_id', userId)
        .eq('skill_id', skillId);

    // Calculate totals
    const { data: allProgress } = await supabase
        .from('skill_progress')
        .select('xp_earned')
        .eq('user_id', userId);

    // Previous total was sum - old skill + old value; new total = sum
    const prevTotal = (allProgress ?? []).reduce(
        (sum, p) => sum + ((p.xp_earned as number) ?? 0), 0
    ) - amount; // subtract what we just added to get the previous total

    const newTotal = prevTotal + amount;

    const prevLevel = calculateLevel(prevTotal);
    const newLevel = calculateLevel(newTotal);
    const levelUp = newLevel.level > prevLevel.level;

    return {
        newTotal,
        levelUp,
        newLevel: newLevel.level,
    };
}
