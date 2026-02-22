'use client';

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';

export default function ProfilePage() {
    const { data: profile, isLoading } = trpc.progress.getProfile.useQuery();
    const utils = trpc.useUtils();

    const updatePrefs = trpc.progress.updateNotificationPrefs.useMutation({
        onSuccess: () => {
            utils.progress.getProfile.invalidate();
        },
    });

    const [questReminder, setQuestReminder] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    // Sync local state from fetched profile
    useEffect(() => {
        if (profile?.notification_prefs) {
            const prefs = profile.notification_prefs as Record<string, unknown>;
            setQuestReminder(prefs.quest_reminder !== false);
            setWeeklyDigest(prefs.weekly_digest !== false);
        }
    }, [profile]);

    const handleToggle = useCallback(
        (key: 'quest_reminder' | 'weekly_digest', value: boolean) => {
            // Optimistic update
            if (key === 'quest_reminder') setQuestReminder(value);
            else setWeeklyDigest(value);

            updatePrefs.mutate({
                quest_reminder: key === 'quest_reminder' ? value : questReminder,
                weekly_digest: key === 'weekly_digest' ? value : weeklyDigest,
            });
        },
        [updatePrefs, questReminder, weeklyDigest]
    );

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto">
                <h1 className="text-xl font-bold text-qc-text mb-6">Perfil</h1>
                <div className="bg-qc-card border border-white/5 rounded-2xl p-6 animate-pulse">
                    <div className="h-16 w-16 rounded-full bg-white/10" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-xl font-bold text-qc-text mb-6">Perfil</h1>

            {/* Profile card */}
            <div className="bg-qc-card border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-qc-primary/20 flex items-center justify-center text-2xl font-bold text-qc-primary">
                        {profile?.name?.charAt(0)?.toUpperCase() || 'Q'}
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-qc-text">
                            {profile?.name || 'Aluno'}
                        </h2>
                        <p className="text-sm text-qc-muted">
                            {profile?.area_of_interest || 'Nenhuma área selecionada'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification preferences */}
            <div id="notifications" className="bg-qc-card border border-white/5 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-qc-text mb-1">Notificações por email</h2>
                <p className="text-xs text-qc-muted mb-5">
                    Escolha quais notificações você deseja receber. Nunca enviamos marketing ou
                    cobrança.
                </p>

                <div className="space-y-4">
                    {/* Quest reminder toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div>
                            <span className="text-sm font-medium text-qc-text">
                                Lembrete de quest diária
                            </span>
                            <p className="text-xs text-qc-muted mt-0.5">
                                Receba um lembrete quando sua quest do dia ainda não foi feita
                            </p>
                        </div>
                        <button
                            role="switch"
                            aria-checked={questReminder}
                            onClick={() => handleToggle('quest_reminder', !questReminder)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${questReminder ? 'bg-qc-primary' : 'bg-white/10'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${questReminder ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </label>

                    {/* Weekly digest toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div>
                            <span className="text-sm font-medium text-qc-text">
                                Resumo semanal
                            </span>
                            <p className="text-xs text-qc-muted mt-0.5">
                                Receba um resumo com suas conquistas da semana
                            </p>
                        </div>
                        <button
                            role="switch"
                            aria-checked={weeklyDigest}
                            onClick={() => handleToggle('weekly_digest', !weeklyDigest)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${weeklyDigest ? 'bg-qc-primary' : 'bg-white/10'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </label>
                </div>

                {updatePrefs.isPending && (
                    <p className="text-xs text-qc-muted mt-3">Salvando...</p>
                )}
            </div>
        </div>
    );
}
