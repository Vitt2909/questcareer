'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';

// ── Variations ──
interface PitchVariation {
    situacao: string;
    dados: string[];
}

const VARIATIONS: PitchVariation[] = [
    {
        situacao: 'Convença seu gestor a aprovar um treinamento para a equipe usando os dados abaixo.',
        dados: ['Produtividade caiu 12% no trimestre', 'Concorrentes investem R$ 5k/mês em capacitação', '3 colaboradores pediram demissão citando falta de desenvolvimento'],
    },
    {
        situacao: 'Explique para um cliente por que o prazo do projeto mudou usando os dados abaixo.',
        dados: ['Escopo aumentou 40% após reunião de refinamento', 'Qualidade de entrega se manteve em 95%', 'Equipe absorveu 2 demandas urgentes não previstas'],
    },
    {
        situacao: 'Proponha uma melhoria no processo da equipe usando os dados abaixo.',
        dados: ['Retrabalho consome 18h/semana da equipe', 'Taxa de erro nas entregas é de 23%', 'Empresas do setor que adotaram revisão por pares reduziram erros em 60%'],
    },
];

function seededIndex(seed: string, max: number): number {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    return Math.abs(h) % max;
}

export default function PitchSixty({ runId, seed, onComplete }: {
    runId: string;
    seed: string;
    onComplete: (result: unknown) => void;
}) {
    const variation = VARIATIONS[seededIndex(seed, VARIATIONS.length)];
    const [text, setText] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [overtime, setOvertime] = useState(false);
    const [pasteDetected, setPasteDetected] = useState(false);
    const [computing, setComputing] = useState(false);
    const seqRef = useRef(0);
    const startedRef = useRef(false);

    const eventMut = trpc.assessment.event.useMutation();
    const completeMut = trpc.assessment.complete.useMutation();

    const sendEvent = useCallback(
        (eventType: string, payload: Record<string, unknown>) => {
            seqRef.current++;
            eventMut.mutate({
                runId,
                eventType,
                payload,
                sequenceNumber: seqRef.current,
            });
        },
        [runId, eventMut]
    );

    // Start timer on first keystroke
    useEffect(() => {
        if (!startedRef.current || overtime) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    setOvertime(true);
                    clearInterval(timer);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [startedRef.current, overtime]);

    const handleTextChange = (val: string) => {
        if (!startedRef.current) startedRef.current = true;
        if (val.length <= 500) setText(val);
    };

    // Paste detection
    const handlePaste = () => {
        setPasteDetected(true);
        sendEvent('paste_detected', { timestamp: Date.now() });
    };

    const handleSubmit = async () => {
        if (text.length < 80) return;
        setComputing(true);

        const wordCount = text.split(/\s+/).filter(Boolean).length;

        sendEvent('pitch_submitted', {
            text,
            dados_fornecidos: variation.dados,
            overtime,
            word_count: wordCount,
            paste_detected: pasteDetected,
        });

        // Small delay to ensure event is processed
        await new Promise((r) => setTimeout(r, 500));

        const result = await completeMut.mutateAsync({ runId });
        setComputing(false);
        onComplete(result);
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    if (computing) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin h-8 w-8 border-2 border-qc-primary border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-qc-muted">Analisando seu pitch...</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-qc-muted">🎤 Pitch em 60s</span>
                <span className={`text-xs font-mono font-bold ${overtime ? 'text-qc-accent' : timeLeft <= 10 ? 'text-qc-danger animate-pulse' : 'text-qc-text'
                    }`}>
                    {overtime ? '⏱️ Tempo esgotado' : `${formatTime(timeLeft)} restante`}
                </span>
            </div>

            {/* Timer bar */}
            <div className="h-1.5 bg-qc-card rounded-full overflow-hidden mb-5">
                <motion.div
                    className={`h-full rounded-full ${overtime ? 'bg-qc-accent' : timeLeft <= 10 ? 'bg-qc-danger' : 'bg-qc-primary'}`}
                    animate={{ width: `${overtime ? 0 : (timeLeft / 60) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Situation card */}
            <div className="bg-qc-card border border-white/5 rounded-2xl p-4 mb-4">
                <p className="text-sm text-qc-text leading-relaxed mb-3">{variation.situacao}</p>
                <div className="space-y-1.5">
                    {variation.dados.map((d, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <span className="text-qc-primary text-xs mt-0.5">📊</span>
                            <p className="text-xs text-qc-secondary font-medium">{d}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Escreva aqui (mínimo 80 caracteres)..."
                    rows={8}
                    className="w-full px-4 py-3 bg-qc-bg border border-white/10 rounded-xl text-sm text-qc-text placeholder-qc-muted resize-none outline-none focus:border-qc-primary transition-colors"
                    maxLength={500}
                />
                <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] text-qc-muted">
                        {text.length < 80 && text.length > 0
                            ? `Mais ${80 - text.length} caracteres necessários`
                            : ''}
                    </span>
                    <span className={`text-[10px] ${text.length >= 450 ? 'text-qc-accent' : 'text-qc-muted'}`}>
                        {text.length}/500 caracteres
                    </span>
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={text.length < 80}
                className="w-full mt-4 py-3 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
                Enviar pitch
            </button>

            {overtime && (
                <p className="text-[10px] text-qc-accent text-center mt-2">
                    O tempo esgotou, mas você pode continuar escrevendo.
                </p>
            )}
        </div>
    );
}
