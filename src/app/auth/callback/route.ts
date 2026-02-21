import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set({ name, value, ...options });
                        });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Check if user needs onboarding
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('area_of_interest')
                    .eq('id', user.id)
                    .single();

                const redirectTo = profile?.area_of_interest
                    ? next
                    : '/onboarding';

                const response = NextResponse.redirect(`${origin}${redirectTo}`);
                cookiesToSet(request, response);
                return response;
            }
        }
    }

    // Auth error — redirect to login
    return NextResponse.redirect(`${origin}/login`);
}

function cookiesToSet(request: NextRequest, response: NextResponse) {
    request.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
    });
}
