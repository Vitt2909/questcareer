'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import { ProgressRing } from '@/components/ui/ProgressRing';

export default function CareerPlansPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roleId = searchParams.get('role');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selecting, setSelecting] = useState(false);

    const planMut = trpc.career.generatePlan.useMutation();
    const selectMut = trpc.career.selectPlan.useMutation();

    // Generate plan on mount if role is provided
    useEffect(() => {
        if (roleId && !planMut.data && !planMut.isPending) {
            planMut.mutate({ roleId });
        }
    }, [roleId]);

    const plan = planMut.data;

    const handleConfirm = async () => {
        if (!plan?.planId) return;
        setSelecting(true);
        try {
            await selectMut.mutateAsync({ planId: plan.planId });
            router.push('/');
        } catch (err) {
            console.error('Select plan error:', err);
            setSelecting(false);
        }
    };

    // Loading state
    if (planMut.isPending) {
        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-qc-card rounded-xl animate-pulse" />
                    <div className="h-40 bg-qc-card rounded-2xl animate-pulse" />
                    <div className="h-32 bg-qc-card rounded-2xl animate-pulse" />
                    <div className="h-32 bg-qc-card rounded-2xl animate-pulse" />
                </div>
                <p className="text-sm text-qc-muted text-center mt-6">
                    Gerando seu plano personalizado...
                </p>
            </div>
        );
    }

    // Error state
    if (planMut.error || (!planMut.data && planMut.isError)) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <span className="text-4xl">⚠️</span>
                <h2 className="text-base font-semibold text-qc-text mt-3">Erro ao gerar plano</h2>
                <p className="text-sm text-qc-muted mt-1">{planMut.error?.message ?? 'Ocorreu um erro inesperado'}</p>
                <button
                    onClick={() => router.push('/career/roles')}
                    className="mt-4 px-4 py-2 bg-qc-primary text-white text-sm rounded-xl"
                >
                    Voltar para áreas
                </button>
            </div>
        );
    }

    // Not generated yet (idle) or no plan found
    if (!plan) {
        return (
            <div className="max-w-2xl mx-auto py-10">
                <p className="text-sm text-qc-muted text-center mt-6">
                    Iniciando geração de plano...
                </p>
            </div>
        );
    }

    const months = Math.round(plan.totalWeeks / 4.3);

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header with adherence */}
            <div className="bg-qc-card border border-white/5 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        <ProgressRing percent={plan.adherencePercent} size={64} strokeWidth={5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{plan.roleIcon}</span>
                            <h1 className="text-lg font-bold text-qc-text">{plan.roleName}</h1>
                        </div>
                        <p className="text-xs text-qc-muted">
                            {plan.adherencePercent}% de afinidade com seu perfil
                        </p>
                    </div>
                </div>
            </div>

            {/* Explanation card */}
            <div className="bg-qc-primary/5 border border-qc-primary/20 rounded-xl p-4 mb-5">
                <p className="text-sm text-qc-text leading-relaxed">{plan.explanation}</p>
            </div>

            {/* Phases */}
            <h2 className="text-sm font-semibold text-qc-muted mb-3">Fases do plano</h2>
            <div className="space-y-3">
                {plan.phases.map((phase, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-qc-card border border-white/5 rounded-2xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-qc-text">
                                Fase {i + 1}: {phase.name}
                            </h3>
                            <span className="text-[10px] text-qc-muted bg-white/5 px-2 py-0.5 rounded-full">
                                {phase.weeks} semanas
                            </span>
                        </div>

                        {/* Skills */}
                        <div className="flex gap-1.5 flex-wrap mb-2">
                            {phase.skills.slice(0, 2).map((skill) => (
                                <span
                                    key={skill.id}
                                    className="text-[9px] px-2 py-0.5 bg-qc-primary/10 text-qc-primary rounded-full"
                                >
                                    {skill.name}
                                </span>
                            ))}
                            {phase.skills.length > 2 && (
                                <span className="text-[9px] px-2 py-0.5 bg-white/5 text-qc-muted rounded-full">
                                    +{phase.skills.length - 2}
                                </span>
                            )}
                        </div>

                        {/* Top resource */}
                        {phase.resources[0] && (
                            <div className="flex items-center gap-2 text-xs text-qc-muted">
                                <span>📚</span>
                                <span className="truncate">{phase.resources[0].title} — {phase.resources[0].provider}</span>
                            </div>
                        )}

                        {/* Evidence */}
                        {phase.evidence && (
                            <p className="text-[10px] text-qc-secondary mt-1.5">
                                📎 {phase.evidence}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Duration */}
            <div className="text-center mt-5 mb-4">
                <p className="text-xs text-qc-muted">
                    Duração estimada: ~<strong className="text-qc-text">{months} meses</strong> no seu ritmo atual
                </p>
            </div>

            {/* CTA */}
            <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 transition-colors"
            >
                Começar este caminho →
            </button>

            {/* Confirmation modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                        onClick={() => !selecting && setShowConfirmModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-qc-card border border-white/10 rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-base font-semibold text-qc-text mb-2">Confirmar escolha</h3>
                            <p className="text-sm text-qc-muted leading-relaxed mb-5">
                                Ao confirmar, vamos criar suas quests para as próximas semanas e
                                inicializar sua skill tree de <strong className="text-qc-text">{plan.roleName}</strong>.
                                Você pode ajustar o ritmo a qualquer momento.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={selecting}
                                    className="flex-1 py-2.5 bg-white/5 text-qc-muted text-sm rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={selecting}
                                    className="flex-1 py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-40 transition-colors"
                                >
                                    {selecting ? (
                                        <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        'Confirmar e começar'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
