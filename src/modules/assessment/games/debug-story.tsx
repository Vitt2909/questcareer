'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';

// ── Report Data ──
interface Report {
    title: string;
    paragraphs: string[];
    inconsistencies: {
        paragraphIndex: number;
        options: string[];
        correctIndex: number;
        explanation: string;
    }[];
}

const REPORTS: Report[] = [
    {
        title: 'Relatório de Vendas — Janeiro',
        paragraphs: [
            'A equipe registrou 120 vendas no mês de janeiro, superando a meta de 100 unidades. O produto mais vendido foi o Kit Básico, com 45 unidades.',
            'O faturamento total foi de R$ 48.000. Cada Kit Básico custou R$ 400 para o cliente final, representando R$ 18.000 do faturamento.',
            'A região Sul liderou com 50 vendas. A região Norte contribuiu com 30, Sudeste com 25 e Centro-Oeste com 25. Todas as regiões tiveram crescimento de pelo menos 10%.',
        ],
        inconsistencies: [
            {
                paragraphIndex: 1,
                options: [
                    'O preço do Kit está incorreto para bater com o faturamento parcial',
                    'O faturamento total está abaixo do esperado',
                    'O número de Kits vendidos deveria ser maior',
                ],
                correctIndex: 0,
                explanation: '45 × R$ 400 = R$ 18.000 ✓, mas se o faturamento total é R$ 48.000 e o Kit representa 37.5%, faz sentido. Na verdade, a conta fecha. Porém, ao verificar: faturamento / preço = 48000 / 400 = 120 kits, mas apenas 45 foram vendidos do Kit Básico. A inconsistência é que 45 kits a R$ 400 = R$ 18.000, que é apenas 37% do total, mas o relatório diz que foi "o mais vendido" sem explicar os outros R$ 30.000.',
            },
            {
                paragraphIndex: 2,
                options: [
                    '50 + 30 + 25 + 25 = 130, mas o total deveria ser 120',
                    'A região Centro-Oeste deveria ter mais vendas que o Norte',
                    'O crescimento de 10% não é significativo',
                ],
                correctIndex: 0,
                explanation: '50 + 30 + 25 + 25 = 130, mas o parágrafo anterior diz que foram 120 vendas no total. Número não bate.',
            },
        ],
    },
    {
        title: 'Relatório de Projeto — Fase 2',
        paragraphs: [
            'A Fase 2 foi concluída em 15 de março, dentro do prazo previsto. A equipe entregou 8 das 8 funcionalidades planejadas.',
            'Os testes automatizados cobriram 85% do código. Foram identificados 12 bugs, dos quais 10 foram corrigidos antes do lançamento. Os 2 restantes são de baixa prioridade.',
            'O custo total da fase foi de R$ 85.000, ficando R$ 5.000 abaixo do orçamento de R$ 80.000. A equipe de 4 desenvolvedores trabalhou por 6 semanas.',
            'A satisfação do cliente foi avaliada em 4.5/5.0 na pesquisa pós-entrega. Nenhuma funcionalidade precisou de retrabalho.',
        ],
        inconsistencies: [
            {
                paragraphIndex: 2,
                options: [
                    'R$ 85.000 está ACIMA, não abaixo, do orçamento de R$ 80.000',
                    'O custo deveria incluir horas extras',
                    'O orçamento original era maior',
                ],
                correctIndex: 0,
                explanation: 'Se o custo foi R$ 85.000 e o orçamento era R$ 80.000, o projeto ficou R$ 5.000 ACIMA do orçamento, não abaixo.',
            },
            {
                paragraphIndex: 3,
                options: [
                    'A nota 4.5 é baixa demais para zero retrabalho',
                    'Se houve 2 bugs não corrigidos, não é verdade que nenhuma funcionalidade precisou de retrabalho',
                    'A pesquisa deveria ter sido feita antes do lançamento',
                ],
                correctIndex: 1,
                explanation: 'O parágrafo 3 diz que 2 bugs não foram corrigidos, mas o parágrafo 4 afirma "nenhuma funcionalidade precisou de retrabalho". Se há bugs pendentes, pode haver necessidade de ajuste.',
            },
        ],
    },
    {
        title: 'Relatório de Treinamento — Q1',
        paragraphs: [
            'No primeiro trimestre, 200 colaboradores participaram dos treinamentos. A taxa de conclusão foi de 92%, totalizando 184 certificados emitidos.',
            'Os treinamentos online tiveram nota média de 4.2/5.0. Os presenciais receberam nota 3.8/5.0. A média geral foi de 4.3/5.0.',
            'O investimento total foi de R$ 120.000 para 40 turmas. O custo médio por turma foi de R$ 3.000, resultando em um custo per capita de R$ 600.',
            'A retenção de conhecimento, medida 30 dias após o treinamento, foi de 78%. Isso representa uma melhoria de 15 pontos percentuais em relação ao trimestre anterior, que registrou 67%.',
        ],
        inconsistencies: [
            {
                paragraphIndex: 1,
                options: [
                    'A média entre 4.2 e 3.8 não é 4.3',
                    'As notas online deveriam ser menores que as presenciais',
                    'A escala deveria ser de 1 a 10',
                ],
                correctIndex: 0,
                explanation: 'A média entre 4.2 e 3.8 é 4.0, não 4.3. Mesmo com ponderação, é improvável chegar a 4.3 sem que os online tenham peso muito maior.',
            },
            {
                paragraphIndex: 3,
                options: [
                    '78% de retenção é muito alto para ser real',
                    '78% - 67% = 11, não 15 pontos percentuais',
                    'A retenção deveria ser medida em 60 dias',
                ],
                correctIndex: 1,
                explanation: '78 - 67 = 11, não 15 pontos percentuais. O relatório exagera a melhoria.',
            },
        ],
    },
];

export default function DebugStory({ runId, onComplete }: {
    runId: string;
    onComplete: (result: unknown) => void;
}) {
    const [reportIndex, setReportIndex] = useState(0);
    const [foundErrors, setFoundErrors] = useState<Set<string>>(new Set());
    const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
    const [attemptCount, setAttemptCount] = useState(0);
    const [computing, setComputing] = useState(false);
    const seqRef = useRef(0);

    const eventMut = trpc.assessment.event.useMutation();
    const completeMut = trpc.assessment.complete.useMutation();

    const report = REPORTS[reportIndex];
    const currentInconsistency = report.inconsistencies.find(
        (inc) => !foundErrors.has(`${reportIndex}-${inc.paragraphIndex}`)
    );
    const allFoundInReport = !currentInconsistency;

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

    // Track reading start
    useEffect(() => {
        sendEvent('reading_started', {
            relatorio_index: reportIndex,
            timestamp: Date.now(),
        });
    }, [reportIndex]);

    // Paste detection
    useEffect(() => {
        const handler = () => {
            sendEvent('paste_detected', { relatorio_index: reportIndex });
        };
        document.addEventListener('paste', handler);
        return () => document.removeEventListener('paste', handler);
    }, [reportIndex, sendEvent]);

    // Auto-advance after finding all errors
    useEffect(() => {
        if (allFoundInReport && feedback) {
            const timer = setTimeout(() => {
                if (reportIndex < REPORTS.length - 1) {
                    setReportIndex((i) => i + 1);
                    setSelectedParagraph(null);
                    setShowOptions(false);
                    setFeedback(null);
                    setAttemptCount(0);
                } else {
                    handleFinish();
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [allFoundInReport, feedback, reportIndex]);

    const handleParagraphClick = (pIdx: number) => {
        if (feedback) return;
        setSelectedParagraph(pIdx);

        // Check if this paragraph has an unfound inconsistency
        const hasError = report.inconsistencies.some(
            (inc) => inc.paragraphIndex === pIdx && !foundErrors.has(`${reportIndex}-${pIdx}`)
        );

        if (hasError) {
            setShowOptions(true);
        } else {
            // Wrong paragraph
            setShowOptions(false);
            setAttemptCount((c) => c + 1);
            sendEvent('answer_attempt', {
                relatorio_index: reportIndex,
                acertou: false,
                tentativa_numero: attemptCount + 1,
                opcao_escolhida: 'wrong_paragraph',
            });
        }
    };

    const handleOptionSelect = (optionIdx: number) => {
        if (!currentInconsistency || selectedParagraph === null) return;

        const correct = optionIdx === currentInconsistency.correctIndex;
        setAttemptCount((c) => c + 1);

        sendEvent('answer_attempt', {
            relatorio_index: reportIndex,
            acertou: correct,
            tentativa_numero: attemptCount + 1,
            opcao_escolhida: currentInconsistency.options[optionIdx],
        });

        if (correct) {
            setFoundErrors((prev) => {
                const next = new Set(Array.from(prev));
                next.add(`${reportIndex}-${currentInconsistency.paragraphIndex}`);
                return next;
            });
            setFeedback({
                correct: true,
                explanation: currentInconsistency.explanation,
            });
            setShowOptions(false);

            // Auto-clear feedback and look for next inconsistency
            setTimeout(() => {
                setFeedback(null);
                setSelectedParagraph(null);
            }, 2000);
        } else {
            setFeedback({
                correct: false,
                explanation: 'Tente outra opção.',
            });
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    const handleFinish = async () => {
        setComputing(true);
        await new Promise((r) => setTimeout(r, 300));
        const result = await completeMut.mutateAsync({ runId });
        setComputing(false);
        onComplete(result);
    };

    if (computing) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin h-8 w-8 border-2 border-qc-primary border-t-transparent rounded-full mb-4" />
                <p className="text-sm text-qc-muted">Calculando seu perfil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-qc-muted">🐛 Debug Story — Relatório {reportIndex + 1} de {REPORTS.length}</span>
                <span className="text-xs text-qc-muted">
                    {foundErrors.size} / {REPORTS.reduce((s, r) => s + r.inconsistencies.length, 0)} erros encontrados
                </span>
            </div>
            <div className="h-1.5 bg-qc-card rounded-full overflow-hidden mb-5">
                <motion.div
                    className="h-full bg-qc-primary rounded-full"
                    animate={{ width: `${(foundErrors.size / REPORTS.reduce((s, r) => s + r.inconsistencies.length, 0)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Report title */}
            <h2 className="text-base font-semibold text-qc-text mb-3">{report.title}</h2>
            <p className="text-[11px] text-qc-muted mb-4">
                Clique no trecho que contém uma inconsistência.
            </p>

            {/* Paragraphs */}
            <div className="space-y-2">
                {report.paragraphs.map((p, i) => {
                    const isError = foundErrors.has(`${reportIndex}-${i}`);
                    const isSelected = selectedParagraph === i;

                    return (
                        <motion.div
                            key={`${reportIndex}-${i}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <button
                                onClick={() => handleParagraphClick(i)}
                                disabled={isError}
                                className={`w-full text-left p-3 rounded-xl text-sm leading-relaxed transition-all border ${isError
                                    ? 'border-green-500/30 bg-green-500/5 text-green-300'
                                    : isSelected
                                        ? 'border-qc-primary bg-qc-primary/10 text-qc-text'
                                        : 'border-white/5 bg-qc-card text-qc-text hover:border-white/10'
                                    }`}
                            >
                                {p}
                                {isError && (
                                    <span className="block mt-1 text-[10px] text-green-400">✅ Inconsistência encontrada</span>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Options dropdown */}
            {showOptions && currentInconsistency && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 bg-qc-card border border-white/5 rounded-xl p-3 space-y-2"
                >
                    <p className="text-xs text-qc-muted mb-2">Qual é o problema?</p>
                    {currentInconsistency.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleOptionSelect(i)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-qc-text bg-white/5 hover:bg-qc-primary/10 hover:text-qc-primary transition-colors"
                        >
                            {opt}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Feedback */}
            {feedback && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-3 p-3 rounded-xl text-sm ${feedback.correct
                        ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                        : 'bg-red-500/10 border border-red-500/20 text-red-300'
                        }`}
                >
                    <p>{feedback.correct ? '✅' : '❌'} {feedback.explanation}</p>
                </motion.div>
            )}
        </div>
    );
}
