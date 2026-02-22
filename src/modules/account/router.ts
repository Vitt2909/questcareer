import { router, protectedProcedure } from '@/lib/trpc/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const accountRouter = router({
    // ─── LGPD: Delete account ────────────────────────────────────
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
        const admin = createAdminClient();

        // Delete all user data (cascade will handle most via FK)
        // But let's be explicit for safety
        const tables = [
            'video_notes',
            'evidences',
            'user_quests',
            'skill_progress',
            'career_plans',
            'assessment_runs',
            'student_feedback',
            'events',
            'attributes',
        ];

        for (const table of tables) {
            await admin.from(table).delete().eq('user_id', ctx.user.id);
        }

        // Delete profile
        await admin.from('profiles').delete().eq('id', ctx.user.id);

        // Delete auth user
        await admin.auth.admin.deleteUser(ctx.user.id);

        return { deleted: true };
    }),

    // ─── LGPD: Export all my data ────────────────────────────────
    exportMyData: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;

        const [
            { data: profile },
            { data: attributes },
            { data: progress },
            { data: quests },
            { data: evidences },
            { data: plans },
            { data: feedback },
            { data: notes },
        ] = await Promise.all([
            ctx.supabase.from('profiles').select('*').eq('id', userId).single(),
            ctx.supabase.from('attributes').select('*').eq('user_id', userId),
            ctx.supabase.from('skill_progress').select('*').eq('user_id', userId),
            ctx.supabase.from('user_quests').select('*').eq('user_id', userId),
            ctx.supabase.from('evidences').select('*').eq('user_id', userId),
            ctx.supabase.from('career_plans').select('*').eq('user_id', userId),
            ctx.supabase.from('student_feedback').select('*').eq('user_id', userId),
            ctx.supabase.from('video_notes').select('*').eq('user_id', userId),
        ]);

        return {
            exported_at: new Date().toISOString(),
            profile,
            attributes: attributes ?? [],
            skill_progress: progress ?? [],
            quests: quests ?? [],
            evidences: evidences ?? [],
            career_plans: plans ?? [],
            feedback: feedback ?? [],
            video_notes: notes ?? [],
        };
    }),
});
