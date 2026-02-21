'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

const DEMAND_BADGES: Record<string, { label: string; icon: string; color: string }> = {
    very_high: { label: 'Alta demanda', icon: '🔥', color: 'bg-red-500/10 text-red-400' },
    high: { label: 'Em crescimento', icon: '📈', color: 'bg-green-500/10 text-green-400' },
    medium: { label: 'Estável', icon: '✅', color: 'bg-blue-500/10 text-blue-400' },
    low: { label: 'Nicho', icon: '📊', color: 'bg-gray-500/10 text-gray-400' },
};

const CATEGORY_TABS = ['Todos', 'Dados', 'Dev', 'Design', 'Negócios', 'Outros'];

export default function CareerRolesPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('Todos');

    const rolesQuery = trpc.career.getRoles.useQuery(undefined, {
        refetchOnWindowFocus: false,
    });

    const roles = rolesQuery.data ?? [];

    const filtered = useMemo(() => {
        return roles.filter((role) => {
            const matchSearch = !search || (role.name as string).toLowerCase().includes(search.toLowerCase());
            const matchTab = activeTab === 'Todos' || (role.category as string) === activeTab;
            return matchSearch && matchTab;
        });
    }, [roles, search, activeTab]);

    if (rolesQuery.isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-10">
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-qc-card rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-2">Escolha sua área</h1>
            <p className="text-sm text-qc-muted mb-5">
                Selecione uma carreira para gerar seu plano personalizado.
            </p>

            {/* Search */}
            <input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-qc-card border border-white/5 rounded-xl text-sm text-qc-text placeholder-qc-muted outline-none focus:border-qc-primary transition-colors mb-4"
            />

            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === tab
                                ? 'bg-qc-primary text-white'
                                : 'bg-qc-card text-qc-muted hover:text-qc-text'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Role cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-4xl">🔍</span>
                    <p className="text-sm text-qc-muted mt-3">Nenhuma área encontrada.</p>
                    <button
                        onClick={() => {
                            const btn = document.querySelector('[title="Enviar feedback"]') as HTMLButtonElement;
                            if (btn) btn.click();
                        }}
                        className="text-xs text-qc-primary hover:underline mt-2"
                    >
                        Não encontrou sua área? Envie feedback
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((role, i) => {
                        const demand = DEMAND_BADGES[(role.demand_level as string) ?? 'medium'];
                        const topSkills = (role.topSkills as Array<{ id: string; name: string }>) ?? [];

                        return (
                            <motion.div
                                key={role.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    href={`/career/plans?role=${role.id}`}
                                    className="block bg-qc-card border border-white/5 rounded-2xl p-4 hover:border-qc-primary/30 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-qc-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                                            {(role.icon as string) ?? '📦'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-semibold text-qc-text group-hover:text-qc-primary transition-colors">
                                                    {role.name as string}
                                                </h3>
                                                {demand && (
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${demand.color}`}>
                                                        {demand.icon} {demand.label}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-qc-muted line-clamp-2 mb-2">
                                                {role.description as string}
                                            </p>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {topSkills.map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="text-[9px] px-2 py-0.5 bg-white/5 text-qc-muted rounded-full"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-qc-muted group-hover:text-qc-primary transition-colors text-sm">→</span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Feedback link */}
            <div className="text-center mt-6">
                <button
                    onClick={() => {
                        const btn = document.querySelector('[title="Enviar feedback"]') as HTMLButtonElement;
                        if (btn) btn.click();
                    }}
                    className="text-xs text-qc-muted hover:text-qc-text transition-colors underline underline-offset-2"
                >
                    Não encontrou sua área? Envie sugestão
                </button>
            </div>
        </div>
    );
}
