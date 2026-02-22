'use client';

import { useState } from 'react';

interface QuizQuestion {
    question: string;
    options: string[];
}

interface QuizScreenProps {
    skillId: string;
    skillName: string;
    questions: QuizQuestion[];
    onSubmit: (answers: number[]) => Promise<{ passed: boolean; score: number; nextSkill: string | null }>;
    onClose: () => void;
}

export function QuizScreen({ skillName, questions, onSubmit, onClose }: QuizScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ passed: boolean; score: number; nextSkill: string | null } | null>(null);

    const question = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleSelectOption = (index: number) => {
        setSelectedOption(index);
        const newAnswers = [...answers];
        newAnswers[currentIndex] = index;
        setAnswers(newAnswers);
    };

    const handleNext = async () => {
        if (selectedOption === null) return;

        if (isLast) {
            setIsSubmitting(true);
            try {
                const res = await onSubmit(answers);
                setResult(res);
            } catch {
                alert('Erro ao enviar quiz');
            }
            setIsSubmitting(false);
        } else {
            setCurrentIndex((i) => i + 1);
            setSelectedOption(answers[currentIndex + 1] === -1 ? null : answers[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
            setSelectedOption(answers[currentIndex - 1] === -1 ? null : answers[currentIndex - 1]);
        }
    };

    // Result screen
    if (result) {
        return (
            <div className="max-w-lg mx-auto bg-qc-card border border-white/10 rounded-2xl p-8 text-center space-y-4">
                <div className="text-4xl">{result.passed ? '🎉' : '📚'}</div>
                <h2 className="text-lg font-bold text-qc-text">
                    {result.passed ? 'Parabéns!' : 'Quase lá!'}
                </h2>
                <p className="text-sm text-qc-muted">
                    Você acertou <span className="text-qc-text font-medium">{result.score}%</span> das questões.
                    {result.passed
                        ? ' Skill desbloqueada!'
                        : ' Você precisa de 80% para desbloquear. Continue estudando.'}
                </p>
                {result.nextSkill && (
                    <p className="text-xs text-qc-primary">
                        Próxima skill: {result.nextSkill}
                    </p>
                )}
                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-qc-primary text-sm text-white font-medium hover:bg-qc-primary/90"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-qc-muted">Quiz — {skillName}</p>
                    <p className="text-xs text-qc-muted mt-0.5">
                        Questão {currentIndex + 1} de {questions.length}
                    </p>
                </div>
                <button onClick={onClose} className="text-xs text-qc-muted hover:text-qc-text">
                    ✕ Cancelar
                </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-qc-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Question */}
            <div className="bg-qc-card border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-qc-text leading-relaxed">
                    {question.question}
                </h3>

                <div className="space-y-2">
                    {question.options.map((option, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectOption(i)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${selectedOption === i
                                    ? 'border-qc-primary bg-qc-primary/10 text-qc-text'
                                    : 'border-white/10 text-qc-muted hover:bg-white/5 hover:text-qc-text'
                                }`}
                        >
                            <span className="font-medium mr-2 text-qc-primary">
                                {String.fromCharCode(65 + i)}.
                            </span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 text-qc-muted hover:bg-white/5 disabled:opacity-30"
                >
                    ← Anterior
                </button>
                <button
                    onClick={handleNext}
                    disabled={selectedOption === null || isSubmitting}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedOption !== null
                            ? 'bg-qc-primary text-white hover:bg-qc-primary/90'
                            : 'bg-white/5 text-qc-muted cursor-not-allowed'
                        } disabled:opacity-50`}
                >
                    {isSubmitting ? 'Enviando...' : isLast ? 'Finalizar Quiz' : 'Próxima →'}
                </button>
            </div>
        </div>
    );
}
