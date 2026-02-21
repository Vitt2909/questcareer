// Notification Service
// Sends transactional emails via Resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'QuestCareer <noreply@questcareer.app>',
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
        });

        if (error) {
            console.error('[Notification] Error sending email:', error);
            return { ok: false, error };
        }

        return { ok: true, id: data?.id };
    } catch (err) {
        console.error('[Notification] Unexpected error:', err);
        return { ok: false, error: err };
    }
}
