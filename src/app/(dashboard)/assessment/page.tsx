'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import TowerSort from '@/modules/assessment/games/tower-sort';
import DebugStory from '@/modules/assessment/games/debug-story';
import PitchSixty from '@/modules/assessment/games/pitch-sixty';

const GAMES = [
    {
        id: 'tower-sort' as const,
        icon: '🏗️',
        title: 'Tower Sort',
        description: 'Organize tarefas por prioridade contra o relógio.',
        duration: '~2 min',
    },
    {
        id: 'debug-story' as const,
        icon: '🐛',
        title: 'Debug Story',
        description: 'Encontre inconsistências em relatórios.',
        duration: '~3 min',
    },
    {
        id: 'pitch-sixty' as const,
        icon: '🎤',
        title: 'Pitch em 60s',
        description: 'Construa um argumento usando dados reais.',
        duration: '~2 min',
    },
];

type ActiveGame = { id: string; runId: string; seed: string } | null;

export default function AssessmentPage() {
    const [activeGame, setActiveGame] = useState<ActiveGame>(null);
    const [justCompleted, setJustCompleted] = useState<string | null>(null);

    const statusQuery = trpc.assessment.getStatus.useQuery(undefined, {
        refetchOnWindowFocus: false,
    });

    const startMut = trpc.assessment.startRun.useMutation({
        onSuccess: (data, variables) => {
            setActiveGame({
                id: variables.gameId,
                runId: data.runId,
                seed: data.seed,
            });
        },
    });

    const completedGames = statusQuery.data?.completedGames ?? [];
    const completedCount = completedGames.length;
    const totalGames = GAMES.length;
    const allDone = completedCount >= totalGames;
    const canSeeResults = completedCount >= 2;

    const handleStartGame = (gameId: 'tower-sort' | 'debug-story' | 'pitch-sixty') => {
        startMut.mutate({ gameId });
    };

    const handleGameComplete = (result: unknown) => {
        const gameId = activeGame?.id;
        setActiveGame(null);
        setJustCompleted(gameId ?? null);
        statusQuery.refetch();
    };

    // ── Render active game ──
    if (activeGame) {
        return (
            <div className="max-w-2xl mx-auto py-4">
                {activeGame.id === 'tower-sort' && (
                    <TowerSort runId={activeGame.runId} seed={activeGame.seed} onComplete={handleGameComplete} />
                )}
                {activeGame.id === 'debug-story' && (
                    <DebugStory runId={activeGame.runId} onComplete={handleGameComplete} />
                )}
                {activeGame.id === 'pitch-sixty' && (
                    <PitchSixty runId={activeGame.runId} seed={activeGame.seed} onComplete={handleGameComplete} />
                )}
            </div>
        );
    }

    // ── Hub view ──
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-2">Diagnóstico</h1>
            <p className="text-sm text-qc-muted mb-6">
                Complete ao menos 2 jogos para gerar seu perfil de atributos.
            </p>

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-qc-muted">{completedCount} de {totalGames} jogos concluídos</span>
                    {allDone && (
                        <span className="text-xs bg-qc-success/10 text-qc-success px-2 py-0.5 rounded-full font-medium">
                            Diagnóstico Completo ✅
                        </span>
                    )}
                </div>
                <div className="h-2 bg-qc-card rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-qc-primary rounded-full"
                        animate={{ width: `${(completedCount / totalGames) * 100}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            </div>

            {/* Game cards */}
            <div className="space-y-3">
                {GAMES.map((game, i) => {
                    const done = completedGames.includes(game.id);
                    const justDone = justCompleted === game.id;

                    return (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`bg-qc-card border rounded-2xl p-4 transition-all ${done
                                    ? 'border-green-500/20'
                                    : 'border-white/5 hover:border-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${done ? 'bg-green-500/10' : 'bg-qc-primary/10'
                                    }`}>
                                    {done ? '✅' : game.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-qc-text">{game.title}</h3>
                                    <p className="text-xs text-qc-muted">{game.description}</p>
                                    <span className="text-[10px] text-qc-muted/60">{game.duration}</span>
                                </div>
                                <div>
                                    {done ? (
                                        <span className="text-xs text-qc-success font-medium">Concluído</span>
                                    ) : (
                                        <button
                                            onClick={() => handleStartGame(game.id)}
                                            disabled={startMut.isPending}
                                            className="px-4 py-2 bg-qc-primary text-white text-xs font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-40 transition-colors"
                                        >
                                            {startMut.isPending ? '...' : 'Começar'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {justDone && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-qc-success mt-2"
                                >
                                    ✅ Jogo concluído com sucesso!
                                </motion.p>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* CTA */}
            {canSeeResults && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                >
                    <a
                        href="/assessment/result"
                        className="block w-full py-3 bg-qc-primary text-white text-sm font-medium rounded-xl text-center hover:bg-qc-primary/90 transition-colors"
                    >
                        {allDone ? '🎉 Ver meu perfil completo →' : '📊 Ver meu perfil →'}
                    </a>
                </motion.div>
            )}
        </div>
    );
}
