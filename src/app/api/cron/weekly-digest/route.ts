import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Implement weekly digest
    // 1. Aggregate weekly progress per student
    // 2. Generate digest content
    // 3. Send via Resend
    return NextResponse.json({ ok: true, sent: 0 });
}
