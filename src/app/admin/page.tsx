'use client';

import { trpc } from '@/lib/trpc/client';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function MetricCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
    return (
        <div className="bg-qc-card border border-white/10 rounded-xl p-4">
            <p className="text-xs text-qc-muted">{emoji} {label}</p>
            <p className="text-2xl font-bold text-qc-text mt-1">{value}</p>
        </div>
    );
}

export default function AdminOverview() {
    const overview = trpc.admin.getOverview.useQuery();
    const funnel = trpc.admin.getActivationFunnel.useQuery();
    const questsPerDay = trpc.admin.getQuestsPerDay.useQuery();
    const reflectionQuality = trpc.admin.getAvgReflectionWords.useQuery();

    const o = overview.data;
    const f = funnel.data;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-qc-text">Dashboard Admin</h1>
                <span className="text-xs text-qc-muted">Pilot v0.1</span>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard emoji="👥" label="Alunos" value={o?.totalStudents ?? '—'} />
                <MetricCard emoji="✅" label="Quests concluídas" value={o?.totalQuestsCompleted ?? '—'} />
                <MetricCard emoji="📊" label="Eventos" value={o?.totalEvents ?? '—'} />
                <MetricCard emoji="💬" label="Feedbacks" value={o?.totalFeedback ?? '—'} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quests per day */}
                <div className="bg-qc-card border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-qc-text mb-4">Quests/dia (30d)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={questsPerDay.data ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a2e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Funnel */}
                <div className="bg-qc-card border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-medium text-qc-text mb-4">Funil de Ativação</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={f?.steps ?? []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a2e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reflection quality */}
            <div className="bg-qc-card border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-qc-text mb-2">Qualidade das Reflexões</h3>
                <div className="flex items-center gap-6 text-sm">
                    <div>
                        <p className="text-xs text-qc-muted">Média de palavras</p>
                        <p className="text-xl font-bold text-qc-text">{reflectionQuality.data?.avg ?? '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-qc-muted">Total de reflexões</p>
                        <p className="text-xl font-bold text-qc-text">{reflectionQuality.data?.total ?? '—'}</p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <div className="flex gap-3">
                <a
                    href="/admin/students"
                    className="px-4 py-2 rounded-lg bg-white/5 text-sm text-qc-text hover:bg-white/10 transition-colors"
                >
                    👥 Ver Alunos
                </a>
                <a
                    href="/admin/feedback"
                    className="px-4 py-2 rounded-lg bg-white/5 text-sm text-qc-text hover:bg-white/10 transition-colors"
                >
                    💬 Ver Feedbacks
                </a>
                <a
                    href="/admin/content"
                    className="px-4 py-2 rounded-lg bg-white/5 text-sm text-qc-text hover:bg-white/10 transition-colors"
                >
                    📦 Conteúdo
                </a>
            </div>
        </div>
    );
}
