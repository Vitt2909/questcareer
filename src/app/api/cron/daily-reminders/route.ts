import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Implement daily quest reminders via Resend
    // 1. Query profiles where notification_prefs.quest_reminder = true
    // 2. Check who has pending quests for today
    // 3. Send email reminder
    return NextResponse.json({ ok: true, sent: 0 });
}
