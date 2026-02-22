import { z } from 'zod';
import { router, adminProcedure } from '@/lib/trpc/server';
import { seedDatabase } from '@/lib/seed/career-data';
import { seedPlatforms } from '@/lib/seed/platforms';

export const adminRouter = router({
    // ─── Overview ────────────────────────────────────────────────
    getOverview: adminProcedure.query(async ({ ctx }) => {
        const { data: totalStudents } = await ctx.supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('is_admin', false);

        const { data: totalQuests } = await ctx.supabase
            .from('user_quests')
            .select('id', { count: 'exact', head: true })
            .not('completed_at', 'is', null);

        const { data: totalEvents } = await ctx.supabase
            .from('events')
            .select('id', { count: 'exact', head: true });

        const { data: totalFeedback } = await ctx.supabase
            .from('student_feedback')
            .select('id', { count: 'exact', head: true });

        return {
            totalStudents: totalStudents?.length ?? 0,
            totalQuestsCompleted: totalQuests?.length ?? 0,
            totalEvents: totalEvents?.length ?? 0,
            totalFeedback: totalFeedback?.length ?? 0,
        };
    }),

    // ─── Activation Funnel ───────────────────────────────────────
    getActivationFunnel: adminProcedure.query(async ({ ctx }) => {
        const { data: allProfiles } = await ctx.supabase
            .from('profiles')
            .select('id, onboarding_completed, created_at')
            .eq('is_admin', false);

        const profiles = allProfiles ?? [];
        const total = profiles.length;
        const onboarded = profiles.filter((p) => p.onboarding_completed).length;

        // Users with at least one plan
        const { data: plansData } = await ctx.supabase
            .from('career_plans')
            .select('user_id')
            .not('selected_at', 'is', null);
        const withPlan = new Set((plansData ?? []).map((p) => p.user_id as string)).size;

        // Users with at least one completed quest
        const { data: questsData } = await ctx.supabase
            .from('user_quests')
            .select('user_id')
            .not('completed_at', 'is', null);
        const withQuest = new Set((questsData ?? []).map((q) => q.user_id as string)).size;

        return {
            steps: [
                { label: 'Cadastro', count: total },
                { label: 'Onboarding', count: onboarded },
                { label: 'Plano selecionado', count: withPlan },
                { label: '1ª Quest', count: withQuest },
            ],
        };
    }),

    // ─── Quests per day (last 30 days) ───────────────────────────
    getQuestsPerDay: adminProcedure.query(async ({ ctx }) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data } = await ctx.supabase
            .from('user_quests')
            .select('completed_at')
            .not('completed_at', 'is', null)
            .gte('completed_at', thirtyDaysAgo.toISOString());

        const byDay: Record<string, number> = {};
        for (const q of data ?? []) {
            const day = (q.completed_at as string).split('T')[0];
            byDay[day] = (byDay[day] ?? 0) + 1;
        }

        return Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
    }),

    // ─── Students list ───────────────────────────────────────────
    getStudents: adminProcedure
        .input(z.object({
            class: z.string().optional(),
            page: z.number().default(1),
            pageSize: z.number().default(20),
        }))
        .query(async ({ ctx, input }) => {
            let query = ctx.supabase
                .from('profiles')
                .select('id, name, school_class, last_seen, created_at, onboarding_completed')
                .eq('is_admin', false)
                .order('name')
                .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

            if (input.class) query = query.eq('school_class', input.class);

            const { data, error } = await query;
            if (error) throw error;
            return data ?? [];
        }),

    // ─── Student detail ──────────────────────────────────────────
    getStudentDetail: adminProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const { data: profile } = await ctx.supabase
                .from('profiles')
                .select('*, attributes(*)')
                .eq('id', input.userId)
                .single();

            const { data: progress } = await ctx.supabase
                .from('skill_progress')
                .select('*, skills(name)')
                .eq('user_id', input.userId);

            const { data: recentQuests } = await ctx.supabase
                .from('user_quests')
                .select('*, quests(title)')
                .eq('user_id', input.userId)
                .order('created_at', { ascending: false })
                .limit(10);

            return { profile, progress: progress ?? [], recentQuests: recentQuests ?? [] };
        }),

    // ─── Feedback ────────────────────────────────────────────────
    getFeedback: adminProcedure
        .input(z.object({
            type: z.string().optional(),
            page: z.number().default(1),
            pageSize: z.number().default(30),
        }))
        .query(async ({ ctx, input }) => {
            let query = ctx.supabase
                .from('student_feedback')
                .select('*, profiles(name)')
                .order('created_at', { ascending: false })
                .range((input.page - 1) * input.pageSize, input.page * input.pageSize - 1);

            if (input.type) query = query.eq('type', input.type);

            const { data, error } = await query;
            if (error) throw error;
            return data ?? [];
        }),

    // ─── Set student class ───────────────────────────────────────
    setStudentClass: adminProcedure
        .input(z.object({
            userId: z.string(),
            schoolClass: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { error } = await ctx.supabase
                .from('profiles')
                .update({ school_class: input.schoolClass })
                .eq('id', input.userId);

            if (error) throw error;
            return { updated: true };
        }),

    // ─── Avg reflection words ────────────────────────────────────
    getAvgReflectionWords: adminProcedure.query(async ({ ctx }) => {
        const { data } = await ctx.supabase
            .from('evidences')
            .select('reflection')
            .eq('type', 'reflection')
            .not('reflection', 'is', null);

        if (!data || data.length === 0) return { avg: 0, total: 0 };

        const totalWords = data.reduce((sum, e) => {
            const words = (e.reflection as string).trim().split(/\s+/).length;
            return sum + words;
        }, 0);

        return {
            avg: Math.round(totalWords / data.length),
            total: data.length,
        };
    }),

    // ─── Seed content ────────────────────────────────────────────
    seedContent: adminProcedure.mutation(async ({ ctx }) => {
        const platformResult = await seedPlatforms(ctx.supabase);
        await seedDatabase(ctx.supabase);
        return { seeded: true, ...platformResult };
    }),
});
