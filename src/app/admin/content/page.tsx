'use client';

import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';

export default function AdminContent() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedResult, setSeedResult] = useState<string | null>(null);

    const seedMutation = trpc.admin.seedContent.useMutation();

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            const result = await seedMutation.mutateAsync();
            setSeedResult(`✅ Seed concluído: ${result.platforms} plataformas`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro';
            setSeedResult(`❌ Erro: ${message}`);
        }
        setIsSeeding(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-qc-text">Conteúdo</h1>
                <a href="/admin" className="text-xs text-qc-primary hover:underline">← Dashboard</a>
            </div>

            {/* Seed section */}
            <div className="bg-qc-card border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-qc-text">🌱 Seed inicial</h3>
                <p className="text-xs text-qc-muted">
                    Executa o seed de plataformas, roles, skills, resources e quests. Operação idempotente (upsert).
                </p>

                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="px-4 py-2 rounded-lg bg-qc-primary text-sm text-white font-medium hover:bg-qc-primary/90 disabled:opacity-50"
                >
                    {isSeeding ? 'Executando...' : 'Executar Seed'}
                </button>

                {seedResult && (
                    <p className="text-xs text-qc-text">{seedResult}</p>
                )}
            </div>

            {/* Content counts */}
            <div className="bg-qc-card border border-white/10 rounded-xl p-6 space-y-3">
                <h3 className="text-sm font-medium text-qc-text">📦 Catálogo</h3>
                <p className="text-xs text-qc-muted">
                    O catálogo é gerenciado via seed e banco de dados. Os dados de 5 roles, ~35 skills,
                    ~40 resources e ~40 quests estão pré-configurados.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-lg font-bold text-qc-text">5</p>
                        <p className="text-[10px] text-qc-muted">Roles</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-lg font-bold text-qc-text">8</p>
                        <p className="text-[10px] text-qc-muted">Plataformas</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
