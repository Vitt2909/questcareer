'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';

// ── Types ──
interface Task {
    id: string;
    title: string;
    urgencia: 1 | 2 | 3;
    impacto: 1 | 2 | 3;
    esforco: 'P' | 'M' | 'G';
}

// ── Deterministic PRNG ──
function seededRandom(seed: string) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
        h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    };
}

const TASK_NAMES = [
    'Atualizar planilha de metas',
    'Responder email do diretor',
    'Revisar proposta comercial',
    'Preparar reunião semanal',
    'Corrigir erro no relatório',
    'Ligar para fornecedor',
    'Organizar documentos da equipe',
    'Enviar feedback do trimestre',
    'Agendar entrevista candidato',
    'Montar apresentação do projeto',
    'Conferir estoque de materiais',
    'Atualizar cronograma',
    'Revisar ata da reunião',
    'Solicitar aprovação de compra',
    'Fazer follow-up com cliente',
];

function generateTasks(seed: string, count: number): Task[] {
    const rng = seededRandom(seed);
    const names = [...TASK_NAMES].sort(() => rng() - 0.5);
    return Array.from({ length: count }, (_, i) => ({
        id: `task-${i}`,
        title: names[i % names.length],
        urgencia: ([1, 2, 3] as const)[Math.floor(rng() * 3)],
        impacto: ([1, 2, 3] as const)[Math.floor(rng() * 3)],
        esforco: (['P', 'M', 'G'] as const)[Math.floor(rng() * 3)],
    }));
}

// ── Sortable Item ──
function SortableTask({ task, isNew }: { task: Task; isNew: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const urgLabel = task.urgencia === 3 ? '🔴' : task.urgencia === 2 ? '🟡' : '🟢';
    const stars = '★'.repeat(task.impacto) + '☆'.repeat(3 - task.impacto);
    const esforcoLabel = task.esforco === 'P' ? 'Pequeno' : task.esforco === 'M' ? 'Médio' : 'Grande';

    return (
        <motion.div
            initial={isNew ? { x: 300, opacity: 0 } : false}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
        >
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="bg-qc-card border border-white/5 rounded-xl p-3 mb-2 cursor-grab active:cursor-grabbing touch-manipulation select-none"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{urgLabel}</span>
                        <p className="text-sm text-qc-text truncate">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-qc-accent">{stars}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${task.esforco === 'P'
                            ? 'bg-green-500/10 text-green-400'
                            : task.esforco === 'M'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                            {esforcoLabel}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main Component ──
export default function TowerSort({ runId, seed, onComplete }: {
    runId: string;
    seed: string;
    onComplete: (result: unknown) => void;
}) {

    const [tasks, setTasks] = useState<Task[]>(() => generateTasks(seed, 12));
    const [newTaskIds, setNewTaskIds] = useState<Set<string>>(new Set());
    const [timeLeft, setTimeLeft] = useState(90);
    const [completed, setCompleted] = useState(false);
    const [computing, setComputing] = useState(false);
    const seqRef = useRef(0);
    const disruptedRef = useRef(false);
    const disruptionTimeRef = useRef(0);
    const lastInteractionRef = useRef(Date.now());
    const movedNewCardsRef = useRef(false);
    const touchedNewRef = useRef(false);

    const eventMut = trpc.assessment.event.useMutation();
    const completeMut = trpc.assessment.complete.useMutation();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Send event helper
    const sendEvent = useCallback((eventType: string, payload: Record<string, unknown>) => {
        seqRef.current++;
        eventMut.mutate({
            runId,
            eventType,
            payload,
            sequenceNumber: seqRef.current,
        });
    }, [runId, eventMut]);

    // Timer
    useEffect(() => {
        if (completed) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [completed]);

    // Disruption at 45s remaining (i.e. 45s elapsed)
    useEffect(() => {
        if (timeLeft === 45 && !disruptedRef.current) {
            disruptedRef.current = true;
            disruptionTimeRef.current = Date.now();

            // Remove 3 middle cards, add 3 new ones
            setTasks((prev) => {
                const mid = Math.floor(prev.length / 2);
                const remaining = [...prev.slice(0, mid - 1), ...prev.slice(mid + 2)];

                const newCards = generateTasks(seed + '-disruption', 3).map((t, i) => ({
                    ...t,
                    id: `new-${i}`,
                    urgencia: ([2, 3, 1] as const)[i],
                    impacto: ([3, 2, 3] as const)[i],
                }));

                setNewTaskIds(new Set(newCards.map((c) => c.id)));
                return [...remaining, ...newCards];
            });
        }
    }, [timeLeft, seed]);

    // Track disruption reaction at 30s remaining (15s after disruption)
    useEffect(() => {
        if (timeLeft === 30 && disruptedRef.current) {
            const pausouMs = disruptionTimeRef.current > 0
                ? (lastInteractionRef.current - disruptionTimeRef.current)
                : 0;

            sendEvent('disruption_reaction', {
                pausou_ms: Math.max(0, pausouMs),
                reorganizou: movedNewCardsRef.current,
                ignorou_novas: !touchedNewRef.current,
            });
        }
    }, [timeLeft, sendEvent]);

    // Auto-complete when timer hits 0
    useEffect(() => {
        if (timeLeft === 0 && !completed) handleFinish(false);
    }, [timeLeft, completed]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        lastInteractionRef.current = Date.now();

        const oldIndex = tasks.findIndex((t) => t.id === active.id);
        const newIndex = tasks.findIndex((t) => t.id === over.id);
        const newTasks = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newTasks);

        // Track if new cards were moved
        if (newTaskIds.has(active.id as string)) {
            movedNewCardsRef.current = true;
            touchedNewRef.current = true;
        }

        sendEvent('card_moved', {
            from: oldIndex,
            to: newIndex,
            cardId: active.id,
            timestamp: Date.now(),
        });
    };

    const handleFinish = async (voluntary: boolean) => {
        if (completed) return;
        setCompleted(true);
        setComputing(true);

        // Send game_end with task data for optimal order computation
        sendEvent('game_end', {
            ordem_final: tasks.map((t) => t.id),
            task_data: tasks.map((t) => ({
                id: t.id,
                urgencia: t.urgencia,
                impacto: t.impacto,
                esforco: t.esforco,
            })),
            voluntary,
        });

        // Small delay to ensure event is sent
        await new Promise((r) => setTimeout(r, 500));

        const result = await completeMut.mutateAsync({ runId });
        setComputing(false);
        onComplete(result);
    };

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    const timerPercent = (timeLeft / 90) * 100;
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

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
            {/* Timer bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-qc-muted">🏗️ Tower Sort</span>
                    <span className={`text-xs font-mono font-bold ${timeLeft <= 15 ? 'text-qc-danger animate-pulse' : 'text-qc-text'}`}>
                        {formatTime(timeLeft)} restante
                    </span>
                </div>
                <div className="h-1.5 bg-qc-card rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full rounded-full ${timeLeft <= 15 ? 'bg-qc-danger' : 'bg-qc-primary'}`}
                        animate={{ width: `${timerPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Instructions */}
            <p className="text-xs text-qc-muted mb-3">
                Ordene as tarefas por prioridade: mais urgente no topo.
                <span className="block mt-0.5 text-qc-muted/60">
                    🔴 = urgente · ★★★ = alto impacto · Esforço: Pequeno/Médio/Grande
                </span>
            </p>

            {/* Sortable list */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <AnimatePresence>
                        {tasks.map((task) => (
                            <SortableTask key={task.id} task={task} isNew={newTaskIds.has(task.id)} />
                        ))}
                    </AnimatePresence>
                </SortableContext>
            </DndContext>

            {/* Finish button */}
            {!completed && (
                <button
                    onClick={() => handleFinish(true)}
                    className="w-full mt-4 py-3 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 transition-colors"
                >
                    Concluir
                </button>
            )}
        </div>
    );
}
