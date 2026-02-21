import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '@/lib/trpc/server';

export const progressRouter = router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
        const { data, error } = await ctx.supabase
            .from('profiles')
            .select('*')
            .eq('id', ctx.user.id)
            .single();

        if (error) throw error;
        return data;
    }),

    updateOnboarding: protectedProcedure
        .input(
            z.object({
                area_of_interest: z.string(),
                daily_hours_available: z.number(),
                months_to_goal: z.number().int(),
                current_level: z.enum(['beginner', 'has_base', 'intermediate']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('profiles')
                .update({
                    ...input,
                    onboarding_completed: true,
                })
                .eq('id', ctx.user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().optional(),
                school_class: z.string().optional(),
                daily_hours_available: z.number().optional(),
                months_to_goal: z.number().int().optional(),
                area_of_interest: z.string().optional(),
                current_level: z.enum(['beginner', 'has_base', 'intermediate']).optional(),
                notification_prefs: z
                    .object({
                        quest_reminder: z.boolean(),
                        weekly_digest: z.boolean(),
                        hour_preference: z.number().int(),
                    })
                    .optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('profiles')
                .update(input)
                .eq('id', ctx.user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }),

    submitFeedback: protectedProcedure
        .input(
            z.object({
                type: z.enum([
                    'attribute_disagree',
                    'quest_too_hard',
                    'quest_too_easy',
                    'bug',
                    'general',
                ]),
                content: z.string().min(1),
                context: z.record(z.unknown()).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('student_feedback')
                .insert({
                    user_id: ctx.user.id,
                    ...input,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        }),

    saveVideoNote: protectedProcedure
        .input(
            z.object({
                quest_id: z.string(),
                youtube_id: z.string().optional(),
                content: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { data, error } = await ctx.supabase
                .from('video_notes')
                .upsert(
                    {
                        user_id: ctx.user.id,
                        quest_id: input.quest_id,
                        youtube_id: input.youtube_id,
                        content: input.content,
                    },
                    { onConflict: 'user_id,quest_id' }
                )
                .select()
                .single();

            if (error) throw error;
            return data;
        }),

    // Admin: list all students
    adminListStudents: adminProcedure
        .input(
            z.object({
                class: z.string().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            let query = ctx.supabase
                .from('profiles')
                .select('*, attributes(*)')
                .eq('is_admin', false)
                .order('name');

            if (input.class) {
                query = query.eq('school_class', input.class);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }),
});
