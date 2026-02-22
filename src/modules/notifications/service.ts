// NotificationService — Sends transactional emails via Resend
// Respects user notification_prefs. Never throws — errors are logged.

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createElement } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

import { QuestReminderEmail } from './templates/quest-reminder';
import { WeeklyDigestEmail } from './templates/weekly-digest';
import { RecoveryModeEmail } from './templates/recovery-mode';
import { PhaseCompleteEmail } from './templates/phase-complete';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'QuestCareer <noreply@questcareer.app>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ─── Template metadata ──────────────────────────────────────────
const TEMPLATES = {
    'quest-reminder': {
        subject: 'Sua quest de hoje está esperando por você',
        consentKey: 'quest_reminder' as const,
    },
    'weekly-digest': {
        subject: 'Sua semana: confira o que você conquistou',
        consentKey: 'weekly_digest' as const,
    },
    'recovery-mode': {
        subject: 'Retomada fácil — 15 minutos é suficiente',
        consentKey: 'quest_reminder' as const, // uses same pref
    },
    'phase-complete': {
        subject: '', // dynamic subject per call
        consentKey: null, // always send (progress communication)
    },
} as const;

type TemplateName = keyof typeof TEMPLATES;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TemplateData = Record<string, any>;

// ─── Service class ───────────────────────────────────────────────
export class NotificationService {
    /**
     * Render a React Email template and send via Resend.
     * Checks consent before sending (except phase-complete).
     */
    async sendEmail(
        template: TemplateName,
        to: string,
        data: TemplateData,
        overrideSubject?: string
    ): Promise<boolean> {
        try {
            const meta = TEMPLATES[template];

            // ── Consent check ──
            if (meta.consentKey && data._notificationPrefs) {
                const prefs = data._notificationPrefs as Record<string, boolean>;
                if (prefs[meta.consentKey] === false) {
                    console.log(`[Notification] Skipped ${template} for ${to}: user opted out`);
                    return false;
                }
            }

            // ── Render template ──
            const html = await this.renderTemplate(template, data);
            const subject = overrideSubject || meta.subject;

            // ── Send via Resend ──
            const { error } = await resend.emails.send({
                from: FROM,
                to,
                subject,
                html,
            });

            if (error) {
                console.error(`[Notification] Resend error for ${template}:`, error);
                return false;
            }

            console.log(`[Notification] Sent ${template} to ${to}`);
            return true;
        } catch (err) {
            console.error(`[Notification] Unexpected error sending ${template}:`, err);
            return false;
        }
    }

    /**
     * Daily cron: send quest reminders to eligible students.
     */
    async checkAndSendReminders(): Promise<number> {
        const supabase = createAdminClient();
        let sentCount = 0;

        // Eligible profiles: opted in, not seen today, no crisis mode, has active plan
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, name, notification_prefs')
            .eq('crisis_mode', false)
            .not('id', 'is', null);

        if (error || !profiles) {
            console.error('[Notification] Error fetching profiles:', error);
            return 0;
        }

        const todayStr = new Date().toISOString().split('T')[0];

        for (const profile of profiles) {
            const prefs = (profile.notification_prefs as Record<string, unknown>) || {};
            if (prefs.quest_reminder !== true) continue;

            // Check last_seen < today
            const { data: fullProfile } = await supabase
                .from('profiles')
                .select('last_seen')
                .eq('id', profile.id)
                .single();

            if (fullProfile?.last_seen) {
                const lastSeenDate = new Date(fullProfile.last_seen as string)
                    .toISOString()
                    .split('T')[0];
                if (lastSeenDate >= todayStr) continue; // Already seen today
            }

            // Must have an active career plan
            const { data: plan } = await supabase
                .from('career_plans')
                .select('id')
                .eq('user_id', profile.id)
                .not('selected_at', 'is', null)
                .limit(1)
                .maybeSingle();

            if (!plan) continue;

            // Get today's quest
            const { data: todayQuest } = await supabase
                .from('user_quests')
                .select('quest_id, quests(title, resource_type, estimated_minutes, xp_reward)')
                .eq('user_id', profile.id)
                .eq('scheduled_date', todayStr)
                .is('completed_at', null)
                .limit(1)
                .maybeSingle();

            if (!todayQuest) continue;

            // Get user email from auth
            const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
            if (!authUser?.user?.email) continue;

            const quest = todayQuest.quests as unknown as Record<string, unknown> | null;

            const sent = await this.sendEmail('quest-reminder', authUser.user.email, {
                name: profile.name || 'Estudante',
                questTitle: quest?.title || 'Quest do dia',
                questType: quest?.resource_type || 'quest',
                estimatedMinutes: quest?.estimated_minutes || 25,
                xpReward: quest?.xp_reward || 30,
                appUrl: APP_URL,
                _notificationPrefs: prefs,
            });

            if (sent) sentCount++;
        }

        return sentCount;
    }

    /**
     * Weekly cron: send digest to students with activity in the last 7 days.
     */
    async sendWeeklyDigests(): Promise<number> {
        const supabase = createAdminClient();
        let sentCount = 0;

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, name, notification_prefs');

        if (error || !profiles) {
            console.error('[Notification] Error fetching profiles:', error);
            return 0;
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString();

        for (const profile of profiles) {
            const prefs = (profile.notification_prefs as Record<string, unknown>) || {};
            if (prefs.weekly_digest !== true) continue;

            // Check for recent activity
            const { data: recentQuests } = await supabase
                .from('user_quests')
                .select('xp_granted, completed_at, scheduled_date')
                .eq('user_id', profile.id)
                .gte('completed_at', sevenDaysAgoStr)
                .not('completed_at', 'is', null);

            if (!recentQuests || recentQuests.length === 0) continue;

            // Aggregate stats
            const xpSemana = recentQuests.reduce(
                (sum, q) => sum + ((q.xp_granted as number) || 0),
                0
            );
            const questsCompletadas = recentQuests.length;

            // Calculate streak (consecutive days with completions)
            const completionDays = new Set(
                recentQuests.map((q) =>
                    new Date(q.completed_at as string).toISOString().split('T')[0]
                )
            );
            let streakDias = 0;
            const d = new Date();
            for (let i = 0; i < 30; i++) {
                if (completionDays.has(d.toISOString().split('T')[0])) {
                    streakDias++;
                    d.setDate(d.getDate() - 1);
                } else {
                    break;
                }
            }

            // Get skills that progressed
            const { data: skillProgress } = await supabase
                .from('skill_progress')
                .select('skill_id, skills(name, level)')
                .eq('user_id', profile.id)
                .gte('last_activity', sevenDaysAgoStr);

            const skillsAvancadas = (skillProgress || []).map((sp) => {
                const skill = sp.skills as unknown as Record<string, unknown> | null;
                return {
                    name: (skill?.name as string) || 'Skill',
                    level: (skill?.level as string) || 'basic',
                };
            });

            // Get role name
            const { data: activePlan } = await supabase
                .from('career_plans')
                .select('role_id, roles(name)')
                .eq('user_id', profile.id)
                .not('selected_at', 'is', null)
                .limit(1)
                .maybeSingle();

            const roleName =
                (activePlan?.roles as unknown as Record<string, unknown> | null)?.name as string ||
                'sua carreira';

            // Get next quest
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: nextQuest } = await supabase
                .from('user_quests')
                .select('quests(title, estimated_minutes, xp_reward)')
                .eq('user_id', profile.id)
                .gte('scheduled_date', todayStr)
                .is('completed_at', null)
                .order('scheduled_date', { ascending: true })
                .limit(1)
                .maybeSingle();

            const quest = nextQuest?.quests as unknown as Record<string, unknown> | null;
            const proximaQuest = quest
                ? {
                    title: quest.title as string,
                    estimatedMinutes: quest.estimated_minutes as number,
                    xpReward: quest.xp_reward as number,
                }
                : null;

            // Get user email
            const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
            if (!authUser?.user?.email) continue;

            const sent = await this.sendEmail(
                'weekly-digest',
                authUser.user.email,
                {
                    name: profile.name || 'Estudante',
                    roleName,
                    xpSemana,
                    questsCompletadas,
                    streakDias,
                    skillsAvancadas,
                    proximaQuest,
                    appUrl: APP_URL,
                    _notificationPrefs: prefs,
                },
                `Sua semana em ${roleName}: confira o que você conquistou`
            );

            if (sent) sentCount++;
        }

        return sentCount;
    }

    /**
     * Event-driven: notify when a phase is completed. Always sent.
     */
    async notifyPhaseComplete(
        userId: string,
        phaseName: string,
        proximaFase: string
    ): Promise<void> {
        const supabase = createAdminClient();

        // Get profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', userId)
            .single();

        // Get total XP
        const { data: xpData } = await supabase
            .from('skill_progress')
            .select('xp_earned')
            .eq('user_id', userId);

        const totalXP = (xpData || []).reduce(
            (sum, sp) => sum + ((sp.xp_earned as number) || 0),
            0
        );

        // Get skills preview for next phase
        const { data: nextPhaseSkills } = await supabase
            .from('skills')
            .select('name')
            .limit(3);

        // Get user email
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (!authUser?.user?.email) return;

        // Estimate hours from quests completed
        const { data: completedQuests } = await supabase
            .from('user_quests')
            .select('quests(estimated_minutes)')
            .eq('user_id', userId)
            .not('completed_at', 'is', null);

        const totalMinutes = (completedQuests || []).reduce((sum, uq) => {
            const q = uq.quests as unknown as Record<string, unknown> | null;
            return sum + ((q?.estimated_minutes as number) || 0);
        }, 0);
        const totalHoras = Math.round(totalMinutes / 60);

        await this.sendEmail(
            'phase-complete',
            authUser.user.email,
            {
                name: profile?.name || 'Estudante',
                phaseName,
                totalHoras,
                totalXP,
                proximaFase,
                proximaFaseSkills: (nextPhaseSkills || []).map((s) => ({ name: s.name })),
                appUrl: APP_URL,
            },
            `Fase ${phaseName} concluída — você chegou lá!`
        );
    }

    // ─── Private: render template to HTML ────────────────────────
    private async renderTemplate(
        template: TemplateName,
        data: TemplateData
    ): Promise<string> {
        // Strip internal-only keys before passing to component
        const { _notificationPrefs, ...props } = data;
        void _notificationPrefs; // suppress unused warning

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = props as any;
        switch (template) {
            case 'quest-reminder':
                return render(createElement(QuestReminderEmail, p));
            case 'weekly-digest':
                return render(createElement(WeeklyDigestEmail, p));
            case 'recovery-mode':
                return render(createElement(RecoveryModeEmail, p));
            case 'phase-complete':
                return render(createElement(PhaseCompleteEmail, p));
            default:
                throw new Error(`Unknown template: ${template}`);
        }
    }
}

// Singleton
export const notificationService = new NotificationService();
