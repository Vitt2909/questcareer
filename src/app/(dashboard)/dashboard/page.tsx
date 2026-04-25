import Link from 'next/link';

const focusCards = [
    {
        title: 'Definir direcao',
        description: 'Responda o diagnostico e compare trilhas antes de escolher um papel profissional.',
        href: '/assessment',
        cta: 'Abrir diagnostico',
    },
    {
        title: 'Executar a semana',
        description: 'Transforme a carreira escolhida em quests curtas, revisaveis e com progresso visivel.',
        href: '/career/roles',
        cta: 'Ver trilhas',
    },
    {
        title: 'Montar evidencia',
        description: 'Organize projetos, certificados e decisoes para construir um portfolio coerente.',
        href: '/portfolio',
        cta: 'Abrir portfolio',
    },
];

const stats = [
    { label: 'Sequencia', value: '0 dias' },
    { label: 'Plano atual', value: 'Escolha inicial' },
    { label: 'Proxima etapa', value: 'Diagnostico' },
];

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-5xl pb-24">
            <div className="mb-8 rounded-3xl border border-white/10 bg-qc-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-qc-secondary">
                    Painel do aluno
                </p>
                <div className="mt-3 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                    <div>
                        <h1 className="text-3xl font-black leading-tight text-qc-text sm:text-4xl">
                            Comece com uma direcao clara antes de acumular cursos soltos.
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-qc-muted sm:text-base">
                            Use o QuestCareer para escolher uma area, quebrar o caminho em quests
                            semanais e registrar evidencias reais de evolucao.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-qc-primary/20 bg-qc-primary/10 p-4">
                        <p className="text-sm font-semibold text-qc-primary">Primeiro passo recomendado</p>
                        <p className="mt-2 text-sm leading-6 text-qc-muted">
                            Complete o diagnostico para a plataforma sugerir trilhas compativeis com
                            seu tempo, nivel e objetivo.
                        </p>
                        <Link
                            href="/assessment"
                            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-qc-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-qc-primary/90"
                        >
                            Iniciar diagnostico
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs text-qc-muted">{stat.label}</p>
                        <p className="mt-1 text-xl font-black text-qc-text">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {focusCards.map((card) => (
                    <article key={card.title} className="rounded-2xl border border-white/10 bg-qc-card p-5">
                        <h2 className="text-lg font-bold text-qc-text">{card.title}</h2>
                        <p className="mt-3 min-h-24 text-sm leading-6 text-qc-muted">{card.description}</p>
                        <Link
                            href={card.href}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-qc-text transition hover:bg-white/5"
                        >
                            {card.cta}
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}
