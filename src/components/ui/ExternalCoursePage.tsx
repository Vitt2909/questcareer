'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

const HINT_CHIPS = [
    { emoji: '💡', text: 'O que eu não sabia antes?' },
    { emoji: '💡', text: 'O que mais me surpreendeu?' },
    { emoji: '💡', text: 'Onde posso usar isso?' },
];

interface Platform {
    id: string;
    name: string;
    logo_url: string | null;
    signup_url: string;
    certificate_type: string | null;
    certificate_instructions: string | null;
    requires_cpf: boolean;
}

interface ExternalCoursePageProps {
    questId: string;
    courseTitle: string;
    courseUrl: string;
    platform: Platform;
    skillId: string;
    xpReward: number;
    estimatedMinutes: number;
    durationHours?: number;
}

export function ExternalCoursePage({
    questId,
    courseTitle,
    courseUrl,
    platform,
    skillId,
    xpReward,
    durationHours,
}: ExternalCoursePageProps) {
    const router = useRouter();
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState<1 | 2>(1);
    const [reflection, setReflection] = useState('');
    const [certUrl, setCertUrl] = useState('');
    const [certDate, setCertDate] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);

    const completeQuest = trpc.execution.completeQuest.useMutation();
    const submitEvidence = trpc.execution.submitEvidence.useMutation();

    const charCount = reflection.trim().length;
    const canProceed = charCount >= 80;
    const hasCert = certUrl.trim().length > 5 && certDate;

    const handleChipClick = (text: string) => {
        setReflection((prev) => (prev ? `${prev}\n${text} ` : `${text} `));
    };

    const handleTrackOpen = useCallback(() => {
        window.open(courseUrl, '_blank', 'noopener');
    }, [courseUrl]);

    const handleComplete = async (withCert: boolean) => {
        setIsCompleting(true);
        try {
            // 1. Complete quest
            const result = await completeQuest.mutateAsync({
                questId,
                reflection: reflection.trim(),
            });

            // 2. Submit certificate evidence if provided
            let totalXP = result.xpEarned;
            if (withCert && hasCert) {
                await submitEvidence.mutateAsync({
                    skill_id: skillId,
                    type: 'certificate',
                    url: certUrl,
                    platform_id: platform.id,
                    completion_date: certDate,
                    reflection: reflection.trim(),
                    certificate_name: courseTitle,
                });
                totalXP += 300;
            }

            alert(`+${totalXP} XP ⚡${result.levelUp ? ' — LEVEL UP!' : ''}`);
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao concluir';
            alert(message);
            setIsCompleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Platform header */}
            <div className="bg-qc-card border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    {platform.logo_url ? (
                        <img
                            src={platform.logo_url}
                            alt={platform.name}
                            className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">🎓</div>
                    )}
                    <div>
                        <p className="text-xs text-qc-muted">{platform.name}</p>
                        <h2 className="text-base font-semibold text-qc-text">{courseTitle}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-qc-muted">
                    {durationHours && <span>⏱ ~{durationHours}h</span>}
                    <span>⭐ {xpReward} XP + 🏆 300 XP de certificado</span>
                    {platform.certificate_type && (
                        <span className="text-amber-400">🏆 Emite certificado</span>
                    )}
                </div>

                {platform.requires_cpf && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
                        ⚠️ Esta plataforma solicita CPF no cadastro.
                    </div>
                )}
            </div>

            {/* Step-by-step card */}
            <div className="bg-qc-card border border-white/10 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-semibold text-qc-text">Passo a passo</h3>

                {/* Step 1 */}
                <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-qc-primary/20 flex items-center justify-center text-xs font-bold text-qc-primary flex-shrink-0">1</span>
                    <div>
                        <p className="text-sm text-qc-text">Criar conta</p>
                        <a
                            href={platform.signup_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-xs text-qc-primary hover:underline"
                        >
                            Cadastrar em {platform.name} ↗
                        </a>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-qc-primary/20 flex items-center justify-center text-xs font-bold text-qc-primary flex-shrink-0">2</span>
                    <div>
                        <p className="text-sm text-qc-text">Acessar o curso</p>
                        <button
                            onClick={handleTrackOpen}
                            className="inline-flex items-center gap-1 mt-1 text-xs text-qc-primary hover:underline"
                        >
                            Ir para o curso ↗
                        </button>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-qc-primary/20 flex items-center justify-center text-xs font-bold text-qc-primary flex-shrink-0">3</span>
                    <div>
                        <p className="text-sm text-qc-text">Concluir e resgatar certificado</p>
                        {platform.certificate_instructions && (
                            <p className="text-xs text-qc-muted mt-1">{platform.certificate_instructions}</p>
                        )}
                    </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-qc-primary/20 flex items-center justify-center text-xs font-bold text-qc-primary flex-shrink-0">4</span>
                    <div>
                        <p className="text-sm text-qc-text">Voltar aqui e registrar</p>
                    </div>
                </div>
            </div>

            {/* Action button */}
            <button
                onClick={() => setShowWizard(true)}
                className="w-full py-3 rounded-xl text-sm font-medium bg-qc-primary text-white hover:bg-qc-primary/90 transition-colors"
            >
                Já concluí — Registrar conclusão ✓
            </button>

            {/* Wizard Modal */}
            {showWizard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg bg-qc-card border border-white/10 rounded-2xl p-6 space-y-4">
                        {/* Progress */}
                        <div className="flex items-center gap-2 text-xs text-qc-muted mb-2">
                            <span className={wizardStep === 1 ? 'text-qc-primary font-medium' : ''}>
                                1. Reflexão
                            </span>
                            <span>→</span>
                            <span className={wizardStep === 2 ? 'text-qc-primary font-medium' : ''}>
                                2. Certificado (opcional)
                            </span>
                        </div>

                        {wizardStep === 1 && (
                            <>
                                <h3 className="text-base font-semibold text-qc-text">
                                    ✍️ O que você aprendeu?
                                </h3>

                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="Ex: Aprendi que..."
                                    className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-qc-text placeholder-qc-muted/50 resize-none focus:outline-none focus:ring-1 focus:ring-qc-primary"
                                />

                                <div className="flex items-center justify-between text-xs">
                                    <span className={canProceed ? 'text-qc-success' : 'text-qc-muted'}>
                                        {charCount}/80 caracteres
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {HINT_CHIPS.map((chip, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleChipClick(chip.text)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-qc-primary/10 text-qc-primary hover:bg-qc-primary/20 transition-colors"
                                        >
                                            {chip.emoji} {chip.text}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowWizard(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 text-qc-muted hover:bg-white/5"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => canProceed && setWizardStep(2)}
                                        disabled={!canProceed}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${canProceed
                                            ? 'bg-qc-primary text-white hover:bg-qc-primary/90'
                                            : 'bg-white/5 text-qc-muted cursor-not-allowed'
                                            }`}
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            </>
                        )}

                        {wizardStep === 2 && (
                            <>
                                <h3 className="text-base font-semibold text-qc-text">
                                    🏆 Certificado <span className="text-xs text-qc-muted font-normal">(opcional, +300 XP)</span>
                                </h3>

                                {platform.certificate_instructions && (
                                    <p className="text-xs text-qc-muted bg-white/5 rounded-lg p-3">
                                        {platform.certificate_instructions}
                                    </p>
                                )}

                                <div>
                                    <label className="text-xs text-qc-muted block mb-1">Data de conclusão</label>
                                    <input
                                        type="date"
                                        value={certDate}
                                        onChange={(e) => setCertDate(e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-qc-text focus:outline-none focus:ring-1 focus:ring-qc-primary"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-qc-muted block mb-1">
                                        URL do certificado (HTTPS)
                                    </label>
                                    <input
                                        type="url"
                                        value={certUrl}
                                        onChange={(e) => setCertUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-qc-text placeholder-qc-muted/50 focus:outline-none focus:ring-1 focus:ring-qc-primary"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleComplete(false)}
                                        disabled={isCompleting}
                                        className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 text-qc-muted hover:bg-white/5 disabled:opacity-50"
                                    >
                                        Pular por agora
                                    </button>
                                    <button
                                        onClick={() => handleComplete(true)}
                                        disabled={isCompleting || !hasCert}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${hasCert
                                            ? 'bg-qc-primary text-white hover:bg-qc-primary/90'
                                            : 'bg-white/5 text-qc-muted cursor-not-allowed'
                                            } disabled:opacity-50`}
                                    >
                                        {isCompleting ? 'Enviando...' : 'Enviar e concluir ✓'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
