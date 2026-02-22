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
export const EVENTS = {
    // Quest lifecycle
    QUEST_STARTED: 'QUEST_STARTED',
    QUEST_COMPLETED: 'QUEST_COMPLETED',
    QUEST_SKIPPED: 'QUEST_SKIPPED',
    // Video
    VIDEO_PLAY: 'VIDEO_PLAY',
    VIDEO_COMPLETE: 'VIDEO_COMPLETE',
    // Evidence
    CERTIFICATE_SUBMITTED: 'CERTIFICATE_SUBMITTED',
    EVIDENCE_SUBMITTED: 'EVIDENCE_SUBMITTED',
    // Quiz
    QUIZ_STARTED: 'QUIZ_STARTED',
    QUIZ_PASSED: 'QUIZ_PASSED',
    QUIZ_FAILED: 'QUIZ_FAILED',
    // Skill / Phase
    SKILL_COMPLETED: 'SKILL_COMPLETED',
    PHASE_COMPLETED: 'PHASE_COMPLETED',
    // User
    PROFILE_UPDATED: 'PROFILE_UPDATED',
    CRISIS_MODE_ACTIVATED: 'CRISIS_MODE_ACTIVATED',
    // Assessment
    ASSESSMENT_STARTED: 'ASSESSMENT_STARTED',
    ASSESSMENT_COMPLETED: 'ASSESSMENT_COMPLETED',
    // Career
    CAREER_PLAN_SELECTED: 'CAREER_PLAN_SELECTED',
    // Feedback
    FEEDBACK_SUBMITTED: 'FEEDBACK_SUBMITTED',
    // Onboarding
    ONBOARDING_STARTED: 'ONBOARDING_STARTED',
    ONBOARDING_COMPLETED: 'ONBOARDING_COMPLETED',
    // Admin
    SEED_RUN: 'SEED_RUN',
    // Auth
    LOGIN: 'LOGIN',
    SIGNUP: 'SIGNUP',
    // Navigation
    PAGE_VIEW: 'PAGE_VIEW',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
