'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const FEEDBACK_TYPES = [
    { value: '', label: 'Todos' },
    { value: 'attribute_disagree', label: 'Atributo incorreto' },
    { value: 'quest_too_hard', label: 'Quest difícil' },
    { value: 'quest_too_easy', label: 'Quest fácil' },
    { value: 'bug', label: 'Bug' },
    { value: 'general', label: 'Geral' },
];

export default function AdminFeedback() {
    const [typeFilter, setTypeFilter] = useState('');

    const feedback = trpc.admin.getFeedback.useQuery({
        type: typeFilter || undefined,
    });

    const handleExportCSV = () => {
        const rows = feedback.data ?? [];
        if (rows.length === 0) return;

        const headers = ['Data', 'Tipo', 'Conteúdo', 'Aluno'];
        const csvContent = [
            headers.join(','),
            ...rows.map((f) => {
                const profile = f.profiles as Record<string, unknown> | null;
                return [
                    new Date(f.created_at as string).toLocaleDateString('pt-BR'),
                    f.type as string,
                    `"${((f.content as string) || '').replace(/"/g, '""')}"`,
                    `"${((profile?.name as string) || 'Anon').replace(/"/g, '""')}"`,
                ].join(',');
            }),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-qc-text">Feedbacks</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-qc-text hover:bg-white/10"
                    >
                        📥 Exportar CSV
                    </button>
                    <a href="/admin" className="text-xs text-qc-primary hover:underline self-center">
                        ← Dashboard
                    </a>
                </div>
            </div>

            {/* Type tabs */}
            <div className="flex gap-2 flex-wrap">
                {FEEDBACK_TYPES.map((ft) => (
                    <button
                        key={ft.value}
                        onClick={() => setTypeFilter(ft.value)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${typeFilter === ft.value
                                ? 'bg-qc-primary text-white'
                                : 'bg-white/5 text-qc-muted hover:bg-white/10'
                            }`}
                    >
                        {ft.label}
                    </button>
                ))}
            </div>

            {/* Feedback list */}
            <div className="space-y-3">
                {(feedback.data ?? []).map((f) => {
                    const profile = f.profiles as Record<string, unknown> | null;
                    return (
                        <div
                            key={f.id as string}
                            className="bg-qc-card border border-white/10 rounded-xl p-4 space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-qc-muted">
                                    {(profile?.name as string) || 'Anônimo'} •{' '}
                                    {new Date(f.created_at as string).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-qc-muted">
                                    {f.type as string}
                                </span>
                            </div>
                            <p className="text-sm text-qc-text">{f.content as string}</p>
                        </div>
                    );
                })}

                {feedback.data?.length === 0 && (
                    <p className="text-sm text-qc-muted text-center py-8">Nenhum feedback encontrado.</p>
                )}
            </div>
        </div>
    );
}
