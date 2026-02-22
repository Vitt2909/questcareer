import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Optional rate limiting via Upstash Redis
let rateLimiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;
let assessmentLimiter: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    Promise.all([
        import('@upstash/ratelimit'),
        import('@upstash/redis'),
    ]).then(([{ Ratelimit }, { Redis }]) => {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        rateLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(200, '1 m'),
            prefix: 'rl:global',
        });
        assessmentLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(60, '1 m'),
            prefix: 'rl:assessment',
        });
    }).catch(() => {
        console.warn('[middleware] Upstash rate limiting not available');
    });
}

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/auth/callback', '/onboarding', '/assessment', '/assessment/result', '/career/roles', '/career/plans'];
const ADMIN_PREFIX = '/admin';
const CRON_PREFIX = '/api/cron';
const TRPC_PREFIX = '/api/trpc';

const hasSupabaseConfig =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // tRPC routes: apply rate limiting if available, then let tRPC handle auth
    if (pathname.startsWith(TRPC_PREFIX)) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anon';

        // Assessment-specific rate limit
        if (pathname.includes('assessment') && assessmentLimiter) {
            const { success } = await assessmentLimiter.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
            }
        }

        // Global rate limit
        if (rateLimiter) {
            const { success } = await rateLimiter.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
            }
        }

        return NextResponse.next();
    }

    // Cron routes: validate CRON_SECRET
    if (pathname.startsWith(CRON_PREFIX)) {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.next();
    }

    // If Supabase isn't configured, just pass through
    if (!hasSupabaseConfig) {
        return NextResponse.next();
    }

    // Public routes — just refresh session
    if (PUBLIC_ROUTES.includes(pathname)) {
        return updateSessionAndContinue(request);
    }

    // All other routes need auth
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin routes: check is_admin
    if (pathname.startsWith(ADMIN_PREFIX)) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Update last_seen (fire-and-forget)
    supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id)
        .then();

    return response;
}

function createSupabaseMiddlewareClient(request: NextRequest) {
    let responseToReturn = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    responseToReturn = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        responseToReturn.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    return { supabase, response: responseToReturn };
}

async function updateSessionAndContinue(request: NextRequest) {
    const { response } = createSupabaseMiddlewareClient(request);
    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
