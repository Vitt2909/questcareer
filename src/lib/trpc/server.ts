import { initTRPC, TRPCError } from '@trpc/server';
import { createClient } from '@/lib/supabase/server';
import superjson from 'superjson';

export async function createTRPCContext() {
    // Supabase may not be configured (e.g. local dev without env vars)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { supabase: null, user: null };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return { supabase, user };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
    transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
    const { data: profile } = await ctx.supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', ctx.user.id)
        .single();

    if (!profile?.is_admin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
    }
    return next({ ctx });
});
