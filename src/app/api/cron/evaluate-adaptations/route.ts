import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { evaluateAndAdapt } from '@/modules/execution/scheduler';
import { notificationService } from '@/modules/notifications/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Auth guard
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();

        // Get all users with active career plans
        const { data: plans, error } = await supabase
            .from('career_plans')
            .select('user_id')
            .not('selected_at', 'is', null)
            .is('completed_at', null);

        if (error || !plans) {
            console.error('[Cron] Error fetching plans:', error);
            return NextResponse.json({ ok: false, error: 'DB error' }, { status: 500 });
        }

        // Unique user IDs
        const userIds = Array.from(new Set(plans.map((p) => p.user_id as string)));

        const adaptations: Array<{ userId: string; action: string; message?: string }> = [];
        let recoveryEmailsSent = 0;

        for (const userId of userIds) {
            try {
                const result = await evaluateAndAdapt(supabase, userId);
                adaptations.push({ userId, ...result });

                // If recovery mode was activated, send the email
                if (result.action === 'recovery_activated') {
                    // Get user email
                    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
                    if (!authUser?.user?.email) continue;

                    // Get profile name and prefs
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name, notification_prefs')
                        .eq('id', userId)
                        .single();

                    // Get a short recovery quest
                    const { data: recoveryQuest } = await supabase
                        .from('user_quests')
                        .select('quests(title, estimated_minutes, xp_reward)')
                        .eq('user_id', userId)
                        .eq('is_recovery', true)
                        .is('completed_at', null)
                        .limit(1)
                        .maybeSingle();

                    const quest = recoveryQuest?.quests as unknown as Record<string, unknown> | null;

                    const sent = await notificationService.sendEmail(
                        'recovery-mode',
                        authUser.user.email,
                        {
                            name: profile?.name || 'Estudante',
                            questTitle: (quest?.title as string) || 'Quest de retomada',
                            estimatedMinutes: (quest?.estimated_minutes as number) || 10,
                            xpReward: (quest?.xp_reward as number) || 20,
                            appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                            _notificationPrefs: profile?.notification_prefs || {},
                        }
                    );

                    if (sent) recoveryEmailsSent++;
                }
            } catch (err) {
                console.error(`[Cron] Error evaluating user ${userId}:`, err);
            }
        }

        console.log(
            `[Cron] Evaluate-adaptations: processed=${userIds.length}, recovery_emails=${recoveryEmailsSent}`
        );

        return NextResponse.json({
            ok: true,
            processed: userIds.length,
            recoveryEmailsSent,
            adaptations,
        });
    } catch (err) {
        console.error('[Cron] evaluate-adaptations error:', err);
        return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
    }
}
