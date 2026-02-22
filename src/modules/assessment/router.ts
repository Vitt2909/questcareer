import { z } from 'zod';
import { router, protectedProcedure } from '@/lib/trpc/server';
import { getCalculator, type AttributeDelta, type RawEvent } from './calculator';
import { TRPCError } from '@trpc/server';

const GAME_IDS = ['tower-sort', 'debug-story', 'pitch-sixty'] as const;

export const assessmentRouter = router({
    // ─── Start a new assessment run ───────────────────────────────
    startRun: protectedProcedure
        .input(z.object({ gameId: z.enum(GAME_IDS) }))
        .mutation(async ({ ctx, input }) => {
            const seed = crypto.randomUUID();

            const { data, error } = await ctx.supabase
                .from('assessment_runs')
                .insert({
                    user_id: ctx.user.id,
                    game_id: input.gameId,
                    seed,
                    raw_metrics: { events: [] },
                    is_suspicious: false,
                })
                .select()
                .single();

            if (error) throw error;

            return {
                runId: data.id as string,
                seed,
                gameConfig: { gameId: input.gameId },
            };
        }),

    // ─── Append event to a run ────────────────────────────────────
    event: protectedProcedure
        .input(
            z.object({
                runId: z.string(),
                eventType: z.string(),
                payload: z.record(z.string(), z.any()),
                sequenceNumber: z.number(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Fetch existing run
            const { data: run, error: runError } = await ctx.supabase
                .from('assessment_runs')
                .select('*')
                .eq('id', input.runId)
                .single();

            if (runError || !run) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found' });
            }

            // Validate ownership
            if (run.user_id !== ctx.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your run' });
            }

            const metrics = (run.raw_metrics as { events: RawEvent[] }) ?? { events: [] };
            const lastSeq = metrics.events.length > 0
                ? Math.max(...metrics.events.map((e) => e.seq))
                : -1;

            // Anti-fraud: out-of-order sequence
            let isSuspicious = run.is_suspicious as boolean;
            if (input.sequenceNumber <= lastSeq) {
                isSuspicious = true;
            }

            const newEvent: RawEvent = {
                eventType: input.eventType,
                payload: input.payload,
                ts: Date.now(),
                seq: input.sequenceNumber,
            };

            metrics.events.push(newEvent);

            const { error: updateError } = await ctx.supabase
                .from('assessment_runs')
                .update({
                    raw_metrics: metrics,
                    is_suspicious: isSuspicious,
                })
                .eq('id', input.runId);

            if (updateError) throw updateError;
            return { ok: true };
        }),

    // ─── Complete a run: compute delta + update attributes ────────
    complete: protectedProcedure
        .input(z.object({ runId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Fetch run
            const { data: run, error: runError } = await ctx.supabase
                .from('assessment_runs')
                .select('*')
                .eq('id', input.runId)
                .single();

            if (runError || !run) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Run not found' });
            }
            if (run.user_id !== ctx.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your run' });
            }

            const metrics = (run.raw_metrics as { events: RawEvent[] }) ?? { events: [] };
            const events = metrics.events;

            // Anti-fraud: total time < 30s
            if (events.length >= 2) {
                const first = events[0].ts;
                const last = events[events.length - 1].ts;
                if (last - first < 30000) {
                    await ctx.supabase
                        .from('assessment_runs')
                        .update({
                            is_suspicious: true,
                            completed_at: new Date().toISOString(),
                        })
                        .eq('id', input.runId);

                    return {
                        attributesUpdated: false,
                        delta: {},
                        confidence: 'provisional',
                        sessions_count: 0,
                        suspicious: true,
                    };
                }
            }

            // Strategy: pick calculator for this game
            const calculator = getCalculator(run.game_id as string);
            if (!calculator) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `No calculator for game: ${run.game_id}`,
                });
            }

            const delta = calculator.compute(events);

            // Fetch current attributes (upsert if not exists)
            let { data: attrs } = await ctx.supabase
                .from('attributes')
                .select('*')
                .eq('user_id', ctx.user.id)
                .single();

            if (!attrs) {
                // Create initial attributes
                const { data: newAttrs, error: insertError } = await ctx.supabase
                    .from('attributes')
                    .insert({
                        user_id: ctx.user.id,
                        analytical: 50,
                        execution: 50,
                        communication: 50,
                        resilience: 50,
                        planning: 50,
                        learning_speed: 50,
                        sessions_count: 0,
                        confidence: 'provisional',
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;
                attrs = newAttrs;
            }

            // Weighted average: novo = (atual * count + delta) / (count + 1)
            const count = (attrs.sessions_count as number) ?? 0;
            const updated: Record<string, number> = {};
            const ATTR_KEYS: (keyof AttributeDelta)[] = [
                'analytical', 'execution', 'communication', 'resilience', 'planning', 'learning_speed',
            ];

            for (const key of ATTR_KEYS) {
                const current = (attrs[key] as number) ?? 50;
                const d = delta[key] ?? 0;
                const newVal = (current * count + d) / (count + 1);
                updated[key] = Math.min(100, Math.max(0, Math.round(newVal)));
            }

            const newCount = count + 1;
            const confidence = newCount >= 3 ? 'confirmed' : 'provisional';

            // Update attributes
            const { error: attrUpdateError } = await ctx.supabase
                .from('attributes')
                .update({
                    ...updated,
                    sessions_count: newCount,
                    confidence,
                })
                .eq('user_id', ctx.user.id);

            if (attrUpdateError) throw attrUpdateError;

            // Mark run as completed
            await ctx.supabase
                .from('assessment_runs')
                .update({
                    computed_delta: delta,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', input.runId);

            // Track analytics event
            await ctx.supabase.from('events').insert({
                user_id: ctx.user.id,
                event_name: 'ASSESSMENT_GAME_COMPLETED',
                event_data: { game_id: run.game_id, delta, confidence },
            });

            return {
                attributesUpdated: true,
                delta,
                confidence,
                sessions_count: newCount,
                suspicious: false,
            };
        }),

    // ─── Get assessment status ────────────────────────────────────
    getStatus: protectedProcedure.query(async ({ ctx }) => {
        // Completed runs
        const { data: runs } = await ctx.supabase
            .from('assessment_runs')
            .select('game_id, completed_at')
            .eq('user_id', ctx.user.id)
            .not('completed_at', 'is', null);

        const completedGames = Array.from(new Set((runs ?? []).map((r) => r.game_id as string)));

        // Current attributes
        const { data: attrs } = await ctx.supabase
            .from('attributes')
            .select('*')
            .eq('user_id', ctx.user.id)
            .single();

        return {
            completedGames,
            totalGames: GAME_IDS.length,
            attributes: attrs,
            confidence: (attrs?.confidence as string) ?? 'provisional',
        };
    }),
});
