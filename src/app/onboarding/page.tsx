'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';

const AREAS = [
    { id: 'data', icon: '💾', label: 'Dados', hours: 480 },
    { id: 'backend', icon: '🖥️', label: 'Dev Backend', hours: 560 },
    { id: 'frontend', icon: '🎨', label: 'Dev Frontend', hours: 400 },
    { id: 'ux', icon: '🖱️', label: 'UX/Design', hours: 320 },
    { id: 'marketing', icon: '📣', label: 'Marketing', hours: 400 },
    { id: 'sales', icon: '💼', label: 'Vendas', hours: 400 },
    { id: 'law', icon: '⚖️', label: 'Direito', hours: 400 },
    { id: 'finance', icon: '💰', label: 'Finanças', hours: 400 },
    { id: 'hr', icon: '👥', label: 'RH', hours: 400 },
    { id: 'other', icon: '➕', label: 'Outro', hours: 400 },
];

const TIME_OPTIONS = [
    { label: '30min', hours: 0.5 },
    { label: '1h', hours: 1 },
    { label: '1h30', hours: 1.5 },
    { label: '2h+', hours: 2 },
];

const LEVELS = [
    { id: 'beginner' as const, icon: '🌱', label: 'Iniciante', desc: 'Nunca trabalhei nessa área' },
    { id: 'has_base' as const, icon: '📖', label: 'Tenho base', desc: 'Já estudei ou trabalhei brevemente' },
    { id: 'intermediate' as const, icon: '🚀', label: 'Intermediário', desc: 'Tenho experiência, quero evoluir' },
];

const DEADLINES = [
    { months: 3, label: '3 meses', desc: 'Intensivo — ideal para quem tem mais tempo livre' },
    { months: 6, label: '6 meses', desc: 'Acelerado — ritmo consistente e focado' },
    { months: 12, label: '12 meses', desc: 'Equilibrado — o mais indicado para quem já trabalha ou estuda' },
    { months: 18, label: '18 meses', desc: 'Progressivo — consolidando bem cada etapa' },
];

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
};

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    // Form state
    const [area, setArea] = useState<string | null>(null);
    const [dailyHours, setDailyHours] = useState<number | null>(null);
    const [level, setLevel] = useState<'beginner' | 'has_base' | 'intermediate' | null>(null);
    const [months, setMonths] = useState<number | null>(null);

    const mutation = trpc.progress.updateOnboarding.useMutation({
        onSuccess: () => {
            router.push('/assessment');
        },
    });

    const areaHours = AREAS.find((a) => a.id === area)?.hours ?? 400;
    const estimatedMonths = dailyHours ? Math.ceil(areaHours / (dailyHours * 22)) : null;

    const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 3)); };
    const goBack = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 0)); };

    const handleFinish = () => {
        if (!area || !dailyHours || !level || !months) return;
        mutation.mutate({
            area_of_interest: area,
            daily_hours_available: dailyHours,
            months_to_goal: months,
            current_level: level,
        });
    };

    const canProceed = [
        !!area,
        dailyHours !== null,
        !!level,
        months !== null,
    ];

    return (
        <div className="min-h-screen bg-qc-bg flex flex-col">
            {/* Progress bar */}
            <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-qc-muted">Passo {step + 1} de 4</span>
                    {step > 0 && (
                        <button onClick={goBack} className="text-xs text-qc-primary hover:underline">
                            ← Voltar
                        </button>
                    )}
                </div>
                <div className="h-1.5 bg-qc-card rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-qc-primary rounded-full"
                        animate={{ width: `${((step + 1) / 4) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-20">
                <div className="w-full max-w-lg">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                            {/* Step 0: Area */}
                            {step === 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-qc-text mb-1">Qual área te interessa?</h2>
                                    <p className="text-sm text-qc-muted mb-6">Selecione uma para começar</p>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {AREAS.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => setArea(a.id)}
                                                className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border text-center transition-all ${area === a.id
                                                        ? 'border-qc-primary bg-qc-primary/10 text-qc-primary'
                                                        : 'border-white/5 bg-qc-card text-qc-text hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="text-2xl">{a.icon}</span>
                                                <span className="text-xs font-medium">{a.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Time */}
                            {step === 1 && (
                                <div>
                                    <h2 className="text-lg font-bold text-qc-text mb-1">Quanto tempo você tem por dia para estudar?</h2>
                                    <p className="text-sm text-qc-muted mb-6">Escolha o que mais se encaixa na sua rotina</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {TIME_OPTIONS.map((t) => (
                                            <button
                                                key={t.hours}
                                                onClick={() => setDailyHours(t.hours)}
                                                className={`p-5 rounded-xl border text-center transition-all ${dailyHours === t.hours
                                                        ? 'border-qc-primary bg-qc-primary/10 text-qc-primary'
                                                        : 'border-white/5 bg-qc-card text-qc-text hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="text-xl font-bold">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {estimatedMonths && (
                                        <p className="text-sm text-qc-secondary mt-5 text-center">
                                            Com {dailyHours}h/dia, você pode atingir sua meta em ~{estimatedMonths} meses
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Level */}
                            {step === 2 && (
                                <div>
                                    <h2 className="text-lg font-bold text-qc-text mb-1">Qual é o seu nível hoje nessa área?</h2>
                                    <p className="text-sm text-qc-muted mb-6">Isso ajuda a calibrar seu plano</p>
                                    <div className="space-y-3">
                                        {LEVELS.map((l) => (
                                            <button
                                                key={l.id}
                                                onClick={() => setLevel(l.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${level === l.id
                                                        ? 'border-qc-primary bg-qc-primary/10'
                                                        : 'border-white/5 bg-qc-card hover:border-white/10'
                                                    }`}
                                            >
                                                <span className="text-2xl">{l.icon}</span>
                                                <div>
                                                    <p className={`text-sm font-medium ${level === l.id ? 'text-qc-primary' : 'text-qc-text'}`}>
                                                        {l.label}
                                                    </p>
                                                    <p className="text-xs text-qc-muted">{l.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Deadline */}
                            {step === 3 && (
                                <div>
                                    <h2 className="text-lg font-bold text-qc-text mb-1">Em quanto tempo quer atingir seu objetivo?</h2>
                                    <p className="text-sm text-qc-muted mb-6">Defina seu prazo ideal</p>
                                    <div className="space-y-3">
                                        {DEADLINES.map((d) => (
                                            <button
                                                key={d.months}
                                                onClick={() => setMonths(d.months)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all ${months === d.months
                                                        ? 'border-qc-primary bg-qc-primary/10'
                                                        : 'border-white/5 bg-qc-card hover:border-white/10'
                                                    }`}
                                            >
                                                <p className={`text-sm font-medium ${months === d.months ? 'text-qc-primary' : 'text-qc-text'}`}>
                                                    {d.label}
                                                </p>
                                                <p className="text-xs text-qc-muted mt-0.5">{d.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 inset-x-0 bg-qc-bg/90 backdrop-blur-md border-t border-white/5 px-4 py-4">
                <div className="max-w-lg mx-auto">
                    {step < 3 ? (
                        <button
                            onClick={goNext}
                            disabled={!canProceed[step]}
                            className="w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Continuar
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={!canProceed[3] || mutation.isPending}
                            className="w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            {mutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Salvando...
                                </span>
                            ) : (
                                'Concluir'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
