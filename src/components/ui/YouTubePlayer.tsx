'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useRouter } from 'next/navigation';

const HINT_CHIPS = [
    { emoji: '💡', text: 'O que eu não sabia antes?' },
    { emoji: '💡', text: 'O que mais me surpreendeu?' },
    { emoji: '💡', text: 'Onde posso usar isso?' },
];

interface YouTubePlayerProps {
    questId: string;
    videoId: string;
    isPlaylist?: boolean;
    title: string;
    xpReward: number;
    estimatedMinutes: number;
    skillId: string;
}

export function YouTubePlayer({
    questId,
    videoId,
    isPlaylist,
    title,
    xpReward,
    estimatedMinutes,
}: YouTubePlayerProps) {
    const router = useRouter();
    const [reflection, setReflection] = useState('');
    const [showDrawer, setShowDrawer] = useState(false);
    const [timeSpent, setTimeSpent] = useState(estimatedMinutes);
    const [isCompleting, setIsCompleting] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const saveNote = trpc.progress.saveVideoNote.useMutation();
    const completeQuest = trpc.execution.completeQuest.useMutation();

    const charCount = reflection.trim().length;
    const remaining = Math.max(0, 80 - charCount);
    const canComplete = charCount >= 80;

    // Debounced draft save
    const handleReflectionChange = useCallback(
        (value: string) => {
            setReflection(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                if (value.trim().length > 10) {
                    saveNote.mutate({
                        quest_id: questId,
                        youtube_id: videoId,
                        content: value,
                    });
                }
            }, 1500);
        },
        [questId, videoId, saveNote]
    );

    const handleChipClick = (text: string) => {
        const newValue = reflection ? `${reflection}\n${text} ` : `${text} `;
        handleReflectionChange(newValue);
    };

    const handleComplete = async () => {
        if (!canComplete) return;
        setIsCompleting(true);
        try {
            const result = await completeQuest.mutateAsync({
                questId,
                timeSpentMinutes: timeSpent,
                reflection: reflection.trim(),
            });
            // Show toast-like notification
            alert(`+${result.xpEarned} XP ⚡${result.levelUp ? ' — LEVEL UP!' : ''}`);
            router.push('/');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao concluir';
            alert(message);
            setIsCompleting(false);
        }
    };

    // Load saved draft
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const embedUrl = isPlaylist
        ? `https://www.youtube.com/embed/videoseries?list=${videoId}&rel=0`
        : `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full">
            {/* Video Player — 65% desktop */}
            <div className="w-full lg:w-[65%]">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-white/10">
                    <iframe
                        id="yt-player"
                        src={embedUrl}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Side Panel — 35% desktop */}
            <div className="w-full lg:w-[35%] space-y-4">
                {/* Title + meta */}
                <div>
                    <h2 className="text-base font-semibold text-qc-text">{title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-qc-muted">
                        <span>⏱ ~{estimatedMinutes}min</span>
                        <span>⭐ {xpReward} XP</span>
                    </div>
                </div>

                {/* Reflection */}
                <div className="rounded-xl border border-white/10 bg-qc-card p-4 space-y-3">
                    <label className="text-sm font-medium text-qc-text block">
                        ✍️ O que você aprendeu? <span className="text-xs text-qc-muted">(obrigatório)</span>
                    </label>

                    <textarea
                        value={reflection}
                        onChange={(e) => handleReflectionChange(e.target.value)}
                        placeholder="Ex: Aprendi que variáveis em Python não precisam de declaração de tipo..."
                        className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-qc-text placeholder-qc-muted/50 resize-none focus:outline-none focus:ring-1 focus:ring-qc-primary"
                    />

                    {/* Counter */}
                    <div className="flex items-center justify-between text-xs">
                        <span className={charCount >= 80 ? 'text-qc-success' : 'text-qc-muted'}>
                            {charCount}/80 caracteres
                        </span>
                        {saveNote.isPending && (
                            <span className="text-qc-muted">Salvando rascunho...</span>
                        )}
                    </div>

                    {/* Hint chips */}
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
                </div>

                {/* Complete button */}
                <button
                    onClick={() => canComplete && setShowDrawer(true)}
                    disabled={!canComplete || isCompleting}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${canComplete
                        ? 'bg-qc-primary text-white hover:bg-qc-primary/90 animate-pulse'
                        : 'bg-white/5 text-qc-muted cursor-not-allowed'
                        }`}
                >
                    {canComplete
                        ? 'Concluir Quest ✓'
                        : `Ainda faltam ${remaining} caracteres`}
                </button>
            </div>

            {/* Completion Drawer */}
            {showDrawer && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-qc-card border-t border-white/10 rounded-t-2xl p-6 space-y-4 animate-slide-up">
                        <h3 className="text-base font-semibold text-qc-text">Registrar conclusão</h3>

                        <div>
                            <label className="text-xs text-qc-muted block mb-1">
                                Tempo assistido (minutos)
                            </label>
                            <input
                                type="number"
                                value={timeSpent}
                                onChange={(e) => setTimeSpent(Number(e.target.value))}
                                min={1}
                                max={480}
                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-qc-text focus:outline-none focus:ring-1 focus:ring-qc-primary"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDrawer(false)}
                                className="flex-1 py-2.5 rounded-xl text-sm border border-white/10 text-qc-muted hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                className="flex-1 py-2.5 rounded-xl text-sm bg-qc-primary text-white font-medium hover:bg-qc-primary/90 disabled:opacity-50"
                            >
                                {isCompleting ? 'Enviando...' : 'Confirmar ✓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
