'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

export default function AdminStudents() {
    const [classFilter, setClassFilter] = useState('');
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const students = trpc.admin.getStudents.useQuery({
        class: classFilter || undefined,
        page,
    });

    const detail = trpc.admin.getStudentDetail.useQuery(
        { userId: selectedId! },
        { enabled: !!selectedId }
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-qc-text">Alunos</h1>
                <a href="/admin" className="text-xs text-qc-primary hover:underline">← Dashboard</a>
            </div>

            {/* Filter */}
            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Filtrar por turma..."
                    value={classFilter}
                    onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-qc-text placeholder-qc-muted/50 focus:outline-none focus:ring-1 focus:ring-qc-primary w-48"
                />
            </div>

            <div className="flex gap-6">
                {/* Table */}
                <div className="flex-1 bg-qc-card border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-xs text-qc-muted">
                                <th className="text-left px-4 py-3 font-medium">Nome</th>
                                <th className="text-left px-4 py-3 font-medium">Turma</th>
                                <th className="text-left px-4 py-3 font-medium">Onboarding</th>
                                <th className="text-left px-4 py-3 font-medium">Último acesso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(students.data ?? []).map((s) => (
                                <tr
                                    key={s.id as string}
                                    onClick={() => setSelectedId(s.id as string)}
                                    className={`border-b border-white/5 text-sm cursor-pointer transition-colors hover:bg-white/5 ${selectedId === s.id ? 'bg-qc-primary/10' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3 text-qc-text">{(s.name as string) || '—'}</td>
                                    <td className="px-4 py-3 text-qc-muted">{(s.school_class as string) || '—'}</td>
                                    <td className="px-4 py-3">
                                        {s.onboarding_completed ? (
                                            <span className="text-qc-success text-xs">✅</span>
                                        ) : (
                                            <span className="text-qc-muted text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-qc-muted">
                                        {s.last_seen
                                            ? new Date(s.last_seen as string).toLocaleDateString('pt-BR')
                                            : 'Nunca'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="text-xs text-qc-primary disabled:text-qc-muted"
                        >
                            ← Anterior
                        </button>
                        <span className="text-xs text-qc-muted">Página {page}</span>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={(students.data ?? []).length < 20}
                            className="text-xs text-qc-primary disabled:text-qc-muted"
                        >
                            Próxima →
                        </button>
                    </div>
                </div>

                {/* Detail panel */}
                {selectedId && (
                    <div className="w-80 bg-qc-card border border-white/10 rounded-xl p-5 space-y-4 self-start">
                        {detail.isLoading ? (
                            <p className="text-xs text-qc-muted">Carregando…</p>
                        ) : detail.data ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-qc-text">
                                        {(detail.data.profile?.name as string) || 'Aluno'}
                                    </h3>
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="text-xs text-qc-muted hover:text-qc-text"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="text-xs text-qc-muted space-y-1">
                                    <p>Turma: {(detail.data.profile?.school_class as string) || '—'}</p>
                                    <p>Nível: {(detail.data.profile?.current_level as string) || '—'}</p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-medium text-qc-text mb-2">Skills</h4>
                                    <div className="space-y-1">
                                        {detail.data.progress.map((sp) => {
                                            const skill = sp.skills as Record<string, unknown> | null;
                                            return (
                                                <div key={sp.skill_id as string} className="flex items-center justify-between text-xs">
                                                    <span className="text-qc-muted">{(skill?.name as string) || sp.skill_id}</span>
                                                    <span className={
                                                        sp.status === 'completed' ? 'text-qc-success' :
                                                            sp.status === 'in_progress' ? 'text-qc-primary' : 'text-qc-muted'
                                                    }>
                                                        {sp.status as string}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-medium text-qc-text mb-2">Últimas quests</h4>
                                    <div className="space-y-1">
                                        {detail.data.recentQuests.map((q) => {
                                            const quest = q.quests as Record<string, unknown> | null;
                                            return (
                                                <div key={q.id as string} className="text-xs text-qc-muted flex items-center gap-2">
                                                    <span>{q.completed_at ? '✅' : q.skipped ? '⏭' : '⏳'}</span>
                                                    <span>{(quest?.title as string) || '—'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
