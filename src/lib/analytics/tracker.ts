// Analytics Tracker
// Logs events to the events table for analysis

import { createClient } from '@/lib/supabase/client';

let sessionId: string | null = null;

function getSessionId(): string {
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }
    return sessionId;
}

export async function trackEvent(
    eventName: string,
    properties: Record<string, unknown> = {},
    userId?: string
) {
    try {
        const supabase = createClient();
        await supabase.from('events').insert({
            user_id: userId,
            session_id: getSessionId(),
            event_name: eventName,
            properties,
        });
    } catch (err) {
        console.error('[Analytics] Failed to track event:', err);
    }
}

// Common events
export const Events = {
    QUEST_STARTED: 'quest.started',
    QUEST_COMPLETED: 'quest.completed',
    QUEST_SKIPPED: 'quest.skipped',
    ASSESSMENT_STARTED: 'assessment.started',
    ASSESSMENT_COMPLETED: 'assessment.completed',
    CAREER_PLAN_SELECTED: 'career.plan_selected',
    EVIDENCE_SUBMITTED: 'evidence.submitted',
    FEEDBACK_SUBMITTED: 'feedback.submitted',
    ONBOARDING_STARTED: 'onboarding.started',
    ONBOARDING_COMPLETED: 'onboarding.completed',
    PAGE_VIEW: 'page.view',
} as const;
