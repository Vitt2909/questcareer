'use client';

import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc/client';
import { AttributeCard } from '@/components/ui/AttributeCard';
import { FeedbackButton } from '@/components/ui/FeedbackButton';
import Link from 'next/link';

// ── Descriptive texts per attribute per band ──
const DESCRIPTIONS: Record<string, { high: string; mid: string; low: string }> = {
    analytical: {
        high: 'Você busca padrões e detalhes antes de decidir. Útil em análise, diagnóstico e pesquisa.',
        mid: 'Você equilibra análise e ação — adapta bem a abordagem ao contexto.',
        low: 'Você tende a agir primeiro e ajustar no caminho. Funciona bem em execução rápida.',
    },
    execution: {
        high: 'Você tem facilidade em transformar planos em ação. Tende a entregar com consistência.',
        mid: 'Você executa bem quando o objetivo está claro.',
        low: 'Você prefere planejar com cuidado antes de agir.',
    },
    communication: {
        high: 'Você estrutura bem ideias e argumentos. Sabe usar dados para convencer.',
        mid: 'Você comunica com clareza quando o contexto é familiar.',
        low: 'Você tende a ser mais direto — prefere ações a palavras. Pode ser um estilo eficiente.',
    },
    resilience: {
        high: 'Você lida bem com mudanças inesperadas e mantém o foco sob pressão.',
        mid: 'Você se adapta a imprevistos quando tem tempo para processar.',
        low: 'Você funciona melhor em ambientes previsíveis e estruturados.',
    },
    planning: {
        high: 'Você organiza suas ações com antecedência e lida bem com reordenação de prioridades.',
        mid: 'Você planeja o essencial e improvisa quando necessário.',
        low: 'Você prefere resolver no momento — funciona bem em cenários dinâmicos.',
    },
    learning_speed: {
        high: 'Você absorve conceitos novos rapidamente e identifica padrões com facilidade.',
        mid: 'Você aprende bem com exemplos e prática.',
        low: 'Você prefere aprofundar antes de avançar — foco em qualidade.',
    },
};

const ATTR_LABELS: Record<string, { name: string; icon: string }> = {
    analytical: { name: 'Analítico', icon: '🔬' },
    execution: { name: 'Execução', icon: '⚡' },
    communication: { name: 'Comunicação', icon: '💬' },
    resilience: { name: 'Resiliência', icon: '🛡️' },
    planning: { name: 'Planejamento', icon: '📋' },
    learning_speed: { name: 'Aprendizado', icon: '📚' },
};

function getDescription(attr: string, value: number): string {
    const desc = DESCRIPTIONS[attr];
    if (!desc) return '';
    if (value > 70) return desc.high;
    if (value >= 40) return desc.mid;
    return desc.low;
}

export default function AssessmentResultPage() {
    const statusQuery = trpc.assessment.getStatus.useQuery(undefined, {
        refetchOnWindowFocus: false,
    });

    const status = statusQuery.data;
    const attrs = status?.attributes;
    const confidence = status?.confidence ?? 'provisional';
    const completedCount = status?.completedGames?.length ?? 0;

    if (statusQuery.isLoading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin h-8 w-8 border-2 border-qc-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!attrs || completedCount < 2) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <span className="text-5xl">📊</span>
                <h2 className="text-base font-semibold text-qc-text mt-5">Perfil ainda não disponível</h2>
                <p className="text-sm text-qc-muted mt-2 max-w-xs mx-auto">
                    Complete ao menos 2 jogos para ver seu perfil de atributos.
                </p>
                <Link
                    href="/assessment"
                    className="inline-block mt-5 px-5 py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 transition-colors"
                >
                    Ir para diagnóstico
                </Link>
            </div>
        );
    }

    const attrKeys = Object.keys(ATTR_LABELS);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-2">Seu Perfil de Atributos</h1>
            <p className="text-sm text-qc-muted mb-6">
                Baseado em {completedCount} jogo{completedCount !== 1 ? 's' : ''} · Confiança:{' '}
                <span className={confidence === 'confirmed' ? 'text-qc-success' : 'text-qc-accent'}>
                    {confidence === 'confirmed' ? 'Confirmado' : 'Provisório'}
                </span>
            </p>

            {/* Attribute cards with staggered reveal */}
            <div className="grid gap-3">
                {attrKeys.map((key, i) => {
                    const value = (attrs[key] as number) ?? 50;
                    const label = ATTR_LABELS[key];
                    const desc = getDescription(key, value);

                    return (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.3, duration: 0.4, ease: 'easeOut' }}
                        >
                            <AttributeCard
                                name={label.name}
                                value={value}
                                icon={label.icon}
                                description={desc}
                                isProvisional={confidence !== 'confirmed'}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-qc-card/50 border border-white/5 rounded-xl">
                <p className="text-xs text-qc-muted leading-relaxed">
                    ℹ️ Este diagnóstico é um ponto de partida, não um rótulo definitivo.
                    Seus atributos se atualizam automaticamente conforme você avança nas quests.
                </p>
            </div>

            {/* Disagree button */}
            <button
                onClick={() => {
                    // Trigger feedback button with attribute_disagree
                    const btn = document.querySelector('[title="Enviar feedback"]') as HTMLButtonElement;
                    if (btn) btn.click();
                }}
                className="mt-3 text-xs text-qc-muted hover:text-qc-text transition-colors underline underline-offset-2"
            >
                Não me reconheço nesse resultado
            </button>

            {/* CTA */}
            <Link
                href="/career/roles"
                className="block w-full mt-6 py-3 bg-qc-primary text-white text-sm font-medium rounded-xl text-center hover:bg-qc-primary/90 transition-colors"
            >
                Escolher minha área de carreira →
            </Link>
        </div>
    );
}
