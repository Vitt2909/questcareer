import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Auth guard
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Cron] weekly-digest skipped: RESEND_API_KEY is not configured');
            return NextResponse.json({ ok: true, skipped: true, count: 0 });
        }

        const { notificationService } = await import('@/modules/notifications/service');
        const count = await notificationService.sendWeeklyDigests();
        console.log(`[Cron] Weekly digests sent: ${count}`);
        return NextResponse.json({ ok: true, count });
    } catch (err) {
        console.error('[Cron] weekly-digest error:', err);
        return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
    }
}
