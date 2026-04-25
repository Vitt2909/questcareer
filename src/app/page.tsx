import Link from "next/link";

const metrics = [
  { value: "4 etapas", label: "Onboarding para entender rotina, area e prazo." },
  { value: "7 dias", label: "Ritmo semanal com quests curtas e progresso visivel." },
  { value: "1 painel", label: "Carreira, portfolio, skill tree e perfil no mesmo lugar." },
];

const features = [
  {
    title: "Diagnostico de perfil",
    text: "O aluno informa area de interesse, tempo disponivel, nivel atual e prazo para receber um plano coerente.",
  },
  {
    title: "Quests de evolucao",
    text: "A plataforma transforma estudo em tarefas pequenas com XP, sequencia e reflexoes para consolidar aprendizado.",
  },
  {
    title: "Trilha de carreira",
    text: "Roles, planos, portfolio e skill tree ajudam o estudante a enxergar o caminho profissional com clareza.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-qc-bg text-qc-text">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-qc-secondary">
              QuestCareer
            </p>
            <h1 className="text-lg font-bold">Career guidance OS</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-qc-muted transition hover:bg-white/5 hover:text-qc-text"
            >
              Entrar
            </Link>
            <Link
              href="/onboarding"
              className="rounded-xl bg-qc-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-qc-primary/90"
            >
              Comecar
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full border border-qc-secondary/30 bg-qc-secondary/10 px-3 py-1 text-xs font-semibold text-qc-secondary">
              Plataforma gamificada para decisao de carreira
            </p>
            <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Ajude estudantes a escolher caminhos profissionais com menos achismo.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-qc-muted sm:text-lg">
              QuestCareer combina avaliacao de perfil, trilhas de aprendizado,
              quests e portfolio para transformar orientacao profissional em uma
              rotina pratica de evolucao.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-2xl bg-qc-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-qc-primary/90"
              >
                Ver experiencia do aluno
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-qc-text transition hover:bg-white/5"
              >
                Acessar painel
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-qc-card p-5 shadow-2xl shadow-black/20">
            <div className="rounded-3xl border border-white/10 bg-qc-bg p-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-qc-muted">Quest de hoje</p>
                  <h3 className="text-lg font-bold">Escolha uma area e desbloqueie sua trilha</h3>
                </div>
                <span className="rounded-full bg-qc-accent/15 px-3 py-1 text-xs font-bold text-qc-accent">
                  Nivel 1
                </span>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-qc-primary/15 text-sm font-black text-qc-primary">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold">{feature.title}</h4>
                    </div>
                    <p className="text-sm leading-6 text-qc-muted">{feature.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.value} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-2xl font-black text-qc-secondary">{metric.value}</p>
              <p className="mt-1 text-sm leading-6 text-qc-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
