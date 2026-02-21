'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProgressRing } from '@/components/ui/ProgressRing';

const TYPE_BADGES: Record<string, { icon: string; label: string; color: string }> = {
    youtube: { icon: '📺', label: 'YouTube', color: 'bg-red-500/10 text-red-400' },
    external_course: { icon: '📚', label: 'Curso', color: 'bg-blue-500/10 text-blue-400' },
    external_article: { icon: '📄', label: 'Artigo', color: 'bg-green-500/10 text-green-400' },
    external_exercise: { icon: '🏋️', label: 'Exercício', color: 'bg-purple-500/10 text-purple-400' },
    video: { icon: '📺', label: 'Vídeo', color: 'bg-red-500/10 text-red-400' },
    article: { icon: '📄', label: 'Artigo', color: 'bg-green-500/10 text-green-400' },
    exercise: { icon: '🏋️', label: 'Exercício', color: 'bg-purple-500/10 text-purple-400' },
    quiz: { icon: '❓', label: 'Quiz', color: 'bg-yellow-500/10 text-yellow-400' },
    project: { icon: '🛠️', label: 'Projeto', color: 'bg-orange-500/10 text-orange-400' },
};

export default function DashboardPage() {
    const [showCrisis, setShowCrisis] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [crisisDays, setCrisisDays] = useState(7);
    const [reflection, setReflection] = useState('');
    const [timeSpent, setTimeSpent] = useState<number | undefined>(undefined);
    const [xpAnim, setXpAnim] = useState<{ amount: number; id: number } | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const utils = trpc.useUtils();
    const todayQuery = trpc.execution.getTodayQuest.useQuery(undefined, {
        refetchOnWindowFocus: false,
    });
    const completeMut = trpc.execution.completeQuest.useMutation();
    const crisisMut = trpc.execution.activateCrisisMode.useMutation();
    const skipMut = trpc.execution.skipQuest.useMutation();

    const data = todayQuery.data;
    const quest = data?.quest as Record<string, unknown> | null;
    const questInner = quest?.quests as Record<string, unknown> | undefined;

    const handleComplete = async () => {
        if (!quest?.id) return;
        try {
            const result = await completeMut.mutateAsync({
                questId: quest.id as string,
                reflection,
                timeSpentMinutes: timeSpent,
            });

            setShowComplete(false);
            setReflection('');

            // XP animation
            setXpAnim({ amount: result.xpEarned, id: Date.now() });
            setTimeout(() => setXpAnim(null), 2000);

            // Level up confetti
            if (result.levelUp) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 2500);
            }

            utils.execution.getTodayQuest.invalidate();
        } catch {
            // Error handled by mutation state
        }
    };

    const handleSkip = async () => {
        if (!quest?.id) return;
        await skipMut.mutateAsync({ questId: quest.id as string });
        utils.execution.getTodayQuest.invalidate();
    };

    const handleCrisis = async () => {
        await crisisMut.mutateAsync({ durationDays: crisisDays });
        setShowCrisis(false);
        utils.execution.getTodayQuest.invalidate();
    };

    // Loading
    if (todayQuery.isLoading) {
        return (
            <div className="max-w-2xl mx-auto py-6">
                <div className="space-y-4">
                    <div className="h-8 w-32 bg-qc-card rounded-lg animate-pulse" />
                    <div className="h-48 bg-qc-card rounded-2xl animate-pulse" />
                    <div className="h-16 bg-qc-card rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    // No quest
    if (!quest || !questInner) {
        return (
            <div className="max-w-2xl mx-auto py-6">
                <h1 className="text-xl font-bold text-qc-text mb-6">Início</h1>
                <EmptyState
                    icon="📋"
                    title="Nenhuma quest disponível"
                    description="Escolha uma carreira para começar suas quests."
                    ctaLabel="Escolher carreira"
                    onCta={() => (window.location.href = '/career/roles')}
                />
            </div>
        );
    }

    const resourceUrl = questInner.resource_url as string | undefined;
    const contentType = questInner.resource_type as string | undefined;
    const badge = TYPE_BADGES[contentType ?? ''] ?? TYPE_BADGES.article;
    const estimatedMin = (questInner.estimated_minutes as number) ?? 25;
    const xpReward = (questInner.xp_reward as number) ?? 30;
    const streakDays = data?.streakDays ?? 0;
    const weekProgress = data?.weekProgress ?? 0;
    const upcoming = (data?.upcoming ?? []) as Array<{ id: string; scheduled_date: string; quests: Record<string, unknown> }>;

    return (
        <div className="max-w-2xl mx-auto pb-20 relative">
            {/* XP animation */}
            <AnimatePresence>
                {xpAnim && (
                    <motion.div
                        key={xpAnim.id}
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -80 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-2xl font-bold text-qc-primary"
                    >
                        +{xpAnim.amount} XP ✨
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confetti */}
            {showConfetti && (
                <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="text-6xl"
                    >
                        🎉
                    </motion.div>
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-1/2 mt-12 text-lg font-bold text-qc-primary"
                    >
                        Level Up!
                    </motion.span>
                </div>
            )}

            {/* Streak widget */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-qc-text">Início</h1>
                <div className="flex items-center gap-2 text-sm">
                    {streakDays > 0 ? (
                        <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full font-medium">
                            🔥 {streakDays} dias seguidos
                        </span>
                    ) : (
                        <span className="bg-white/5 text-qc-muted px-3 py-1 rounded-full text-xs">
                            Comece sua sequência hoje ⚡
                        </span>
                    )}
                </div>
            </div>

            {/* Adaptation banner */}
            {data?.adaptation?.action === 'recovery_activated' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4">
                    <p className="text-xs text-yellow-300 font-medium">
                        🛡️ Modo retomada ativado — quests menores por alguns dias.
                    </p>
                </div>
            )}
            {data?.adaptation?.action === 'suggest_skip_ahead' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
                    <p className="text-xs text-green-300 font-medium">
                        🚀 Você está indo rápido! Quer pular para a próxima skill?
                    </p>
                </div>
            )}

            {/* Hero QuestCard */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-qc-card border border-white/5 rounded-2xl p-5 mb-4"
            >
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                            {badge.icon} {badge.label}
                        </span>
                        <h2 className="text-base font-semibold text-qc-text mt-2">
                            {questInner.title as string}
                        </h2>
                        <p className="text-xs text-qc-muted mt-1 line-clamp-2">
                            {questInner.description as string}
                        </p>
                    </div>
                    <div className="flex-shrink-0 ml-3">
                        <ProgressRing percent={(weekProgress / 7) * 100} size={48} strokeWidth={4} label={`${weekProgress}/7`} />
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-qc-muted mb-4">
                    <span>⏱ {estimatedMin} min</span>
                    <span>✨ {xpReward} XP</span>
                </div>

                <div className="flex gap-2">
                    {resourceUrl ? (
                        <a
                            href={resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl text-center hover:bg-qc-primary/90 transition-colors"
                        >
                            Abrir Quest →
                        </a>
                    ) : (
                        <button
                            onClick={() => setShowComplete(true)}
                            className="flex-1 py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 transition-colors"
                        >
                            Completar Quest ✅
                        </button>
                    )}
                    <button
                        onClick={handleSkip}
                        disabled={skipMut.isPending}
                        className="px-4 py-2.5 bg-white/5 text-qc-muted text-sm rounded-xl hover:bg-white/10 transition-colors"
                    >
                        Pular
                    </button>
                </div>

                {/* If quest has external URL, show complete button below */}
                {resourceUrl && (
                    <button
                        onClick={() => setShowComplete(true)}
                        className="w-full mt-2 py-2 bg-white/5 text-qc-text text-sm rounded-xl hover:bg-white/10 transition-colors"
                    >
                        Já concluí esta quest ✅
                    </button>
                )}
            </motion.div>

            {/* XP Bar */}
            <div className="bg-qc-card border border-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between text-xs text-qc-muted mb-2">
                    <span>Progresso semanal</span>
                    <span>{weekProgress}/7 quests</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-qc-primary to-qc-secondary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((weekProgress / 7) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
                {data?.xpToday ? (
                    <p className="text-[10px] text-qc-muted mt-1.5">+{data.xpToday} XP hoje</p>
                ) : null}
            </div>

            {/* Next 3 quests */}
            {upcoming.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-qc-muted mb-2">Próximas quests</h3>
                    <div className="space-y-2">
                        {upcoming.map((uq) => {
                            const q = uq.quests;
                            const tb = TYPE_BADGES[(q?.resource_type as string) ?? ''] ?? TYPE_BADGES.article;
                            return (
                                <div key={uq.id} className="bg-qc-card/50 border border-white/5 rounded-xl p-3 opacity-60">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{tb.icon}</span>
                                        <span className="text-xs text-qc-text truncate">{q?.title as string}</span>
                                        <span className="text-[9px] text-qc-muted ml-auto">{uq.scheduled_date}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Crisis mode FAB */}
            <button
                onClick={() => setShowCrisis(true)}
                className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-qc-card border border-white/10 shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform z-30"
                title="Modo Crise"
            >
                ⚔️
            </button>

            {/* Crisis mode sheet */}
            <AnimatePresence>
                {showCrisis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
                        onClick={() => setShowCrisis(false)}
                    >
                        <motion.div
                            initial={{ y: 300 }}
                            animate={{ y: 0 }}
                            exit={{ y: 300 }}
                            className="bg-qc-card border-t border-white/10 rounded-t-2xl p-6 w-full max-w-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                            <h3 className="text-base font-semibold text-qc-text mb-2">⚔️ Modo Crise</h3>
                            <p className="text-sm text-qc-muted mb-4">
                                Ative se a semana estiver muito corrida. As quests serão reduzidas para 15 minutos.
                            </p>
                            <div className="flex gap-2 mb-5">
                                {[3, 5, 7].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setCrisisDays(d)}
                                        className={`flex-1 py-2 text-sm rounded-xl transition-colors ${crisisDays === d
                                                ? 'bg-qc-primary text-white'
                                                : 'bg-white/5 text-qc-muted'
                                            }`}
                                    >
                                        {d} dias
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleCrisis}
                                disabled={crisisMut.isPending}
                                className="w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl disabled:opacity-40"
                            >
                                {crisisMut.isPending ? 'Ativando...' : `Ativar por ${crisisDays} dias`}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Complete quest drawer */}
            <AnimatePresence>
                {showComplete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
                        onClick={() => setShowComplete(false)}
                    >
                        <motion.div
                            initial={{ y: 400 }}
                            animate={{ y: 0 }}
                            exit={{ y: 400 }}
                            className="bg-qc-card border-t border-white/10 rounded-t-2xl p-6 w-full max-w-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                            <h3 className="text-base font-semibold text-qc-text mb-1">Completar quest</h3>
                            <p className="text-xs text-qc-muted mb-4">
                                Escreva uma reflexão sobre o que aprendeu (mín. 10 palavras / 80 caracteres).
                            </p>

                            <textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="O que eu aprendi com esta quest..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-qc-text placeholder-qc-muted outline-none focus:border-qc-primary transition-colors resize-none mb-1"
                            />
                            <div className="flex justify-between text-[10px] text-qc-muted mb-3">
                                <span>{reflection.length} caracteres</span>
                                <span>{reflection.trim().split(/\s+/).filter(Boolean).length} palavras</span>
                            </div>

                            <div className="mb-4">
                                <label className="text-xs text-qc-muted block mb-1">
                                    Tempo gasto (min) — opcional
                                </label>
                                <input
                                    type="number"
                                    value={timeSpent ?? ''}
                                    onChange={(e) => setTimeSpent(e.target.value ? Number(e.target.value) : undefined)}
                                    placeholder={String(estimatedMin)}
                                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-qc-text outline-none"
                                />
                            </div>

                            {completeMut.error && (
                                <p className="text-xs text-red-400 mb-3">{completeMut.error.message}</p>
                            )}

                            <button
                                onClick={handleComplete}
                                disabled={completeMut.isPending || reflection.length < 80}
                                className="w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-colors"
                            >
                                {completeMut.isPending ? 'Salvando...' : 'Completar e ganhar XP ✨'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
