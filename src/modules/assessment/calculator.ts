// Assessment Calculator — Strategy Pattern
// Each game has its own calculator that computes attribute deltas from raw events

export interface RawEvent {
    eventType: string;
    payload: Record<string, unknown>;
    ts: number;
    seq: number;
}

export interface AttributeDelta {
    analytical?: number;
    execution?: number;
    communication?: number;
    resilience?: number;
    planning?: number;
    learning_speed?: number;
}

export interface AssessmentCalculator {
    compute(events: RawEvent[]): AttributeDelta;
}

// --- Hard clamp: max ±15 per attribute per session ---
function clamp(v: number): number {
    return Math.max(-15, Math.min(15, Math.round(v)));
}

// --- Kendall Tau Distance (0 = identical, 1 = reversed) ---
function kendallTauDistance(a: string[], b: string[]): number {
    const n = a.length;
    if (n <= 1) return 0;
    const posB = new Map(b.map((id, i) => [id, i]));
    let discordant = 0;
    const maxPairs = (n * (n - 1)) / 2;

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const posAi = i;
            const posAj = j;
            const posBi = posB.get(a[i]) ?? i;
            const posBj = posB.get(a[j]) ?? j;
            if ((posAi - posAj) * (posBi - posBj) < 0) discordant++;
        }
    }
    return discordant / maxPairs;
}

// ═══════════════════════════════════════════
// Tower Sort Calculator
// ═══════════════════════════════════════════
export class TowerSortCalculator implements AssessmentCalculator {
    compute(events: RawEvent[]): AttributeDelta {
        const gameEnd = events.find((e) => e.eventType === 'game_end');
        const disruption = events.find((e) => e.eventType === 'disruption_reaction');

        if (!gameEnd) return {};

        const ordemFinal = (gameEnd.payload.ordem_final as string[]) ?? [];
        const taskData = (gameEnd.payload.task_data as Array<{
            id: string; urgencia: number; impacto: number; esforco: string;
        }>) ?? [];

        // Compute optimal order: urgencia*3 + impacto*2 - esforco_num (DESC)
        const esforcoMap: Record<string, number> = { P: 1, M: 2, G: 3 };
        const optimal = [...taskData]
            .sort((a, b) => {
                const sa = a.urgencia * 3 + a.impacto * 2 - (esforcoMap[a.esforco] ?? 2);
                const sb = b.urgencia * 3 + b.impacto * 2 - (esforcoMap[b.esforco] ?? 2);
                return sb - sa;
            })
            .map((t) => t.id);

        const acuracia = optimal.length > 0
            ? 1 - kendallTauDistance(ordemFinal, optimal)
            : 0;

        // Adaptation score from disruption reaction
        let scoreAdaptacao = 0.2;
        if (disruption) {
            const reorganizou = disruption.payload.reorganizou as boolean;
            const pausou = (disruption.payload.pausou_ms as number ?? 0) > 1000;
            if (reorganizou) scoreAdaptacao = 0.8;
            else if (pausou) scoreAdaptacao = 0.5;
        }

        return {
            execution: clamp(acuracia * 15),
            planning: clamp(scoreAdaptacao * 15),
        };
    }
}

// ═══════════════════════════════════════════
// Debug Story Calculator
// ═══════════════════════════════════════════
export class DebugStoryCalculator implements AssessmentCalculator {
    compute(events: RawEvent[]): AttributeDelta {
        const attempts = events.filter((e) => e.eventType === 'answer_attempt');
        if (attempts.length === 0) return {};

        const totalQuestoes = 6; // 3 relatórios × 2 inconsistências
        const acertos = attempts.filter((e) => e.payload.acertou === true).length;
        const taxaAcerto = acertos / (totalQuestoes * 2); // normalized

        // Persistence: avg attempts per question
        const attemptsPerQ = new Map<number, number>();
        for (const a of attempts) {
            const idx = a.payload.relatorio_index as number;
            attemptsPerQ.set(idx, (attemptsPerQ.get(idx) ?? 0) + 1);
        }
        const avgAttempts = Array.from(attemptsPerQ.values()).reduce((s, v) => s + v, 0) / attemptsPerQ.size;
        const persistencia = avgAttempts > 1.5 ? 1.0 : 0.5;

        return {
            analytical: clamp(taxaAcerto * 15),
            planning: clamp(persistencia * 10),
        };
    }
}

// ═══════════════════════════════════════════
// Pitch 60s Calculator
// ═══════════════════════════════════════════
const CONECTIVOS_CAUSAIS = [
    'porque', 'pois', 'portanto', 'isso significa', 'dessa forma', 'logo', 'assim',
];
const VERBOS_ACAO = [
    'propõe', 'podemos', 'vamos', 'aprovem', 'façamos', 'implementar', 'iniciar',
];

export class PitchSixtyCalculator implements AssessmentCalculator {
    compute(events: RawEvent[]): AttributeDelta {
        const pitch = events.find((e) => e.eventType === 'pitch_submitted');
        if (!pitch) return {};

        const text = ((pitch.payload.text as string) ?? '').toLowerCase();
        const dadosFornecidos = (pitch.payload.dados_fornecidos as string[]) ?? [];
        const words = text.split(/\s+/);

        // Has intro: first 30 words mention at least 1 data point
        const first30 = words.slice(0, 30).join(' ');
        const hasIntro = dadosFornecidos.some((d) => first30.includes(d.toLowerCase())) ? 20 : 0;

        // Has argument: contains causal connectors
        const hasArgument = CONECTIVOS_CAUSAIS.some((c) => text.includes(c)) ? 30 : 0;

        // Has CTA: last 30 words include action verb
        const last30 = words.slice(-30).join(' ');
        const hasCta = VERBOS_ACAO.some((v) => last30.includes(v)) ? 20 : 0;

        // Data usage: count data points mentioned
        const dataMentioned = dadosFornecidos.filter((d) => text.includes(d.toLowerCase())).length;
        const dataUsage = Math.min(30, dataMentioned * 10);

        const totalScore = (hasIntro + hasArgument + hasCta + dataUsage) / 100;

        return {
            communication: clamp(totalScore * 15),
            analytical: clamp(totalScore * 8),
        };
    }
}

// ═══════════════════════════════════════════
// Strategy map
// ═══════════════════════════════════════════
const calculators: Record<string, AssessmentCalculator> = {
    'tower-sort': new TowerSortCalculator(),
    'debug-story': new DebugStoryCalculator(),
    'pitch-sixty': new PitchSixtyCalculator(),
};

export function getCalculator(gameId: string): AssessmentCalculator | null {
    return calculators[gameId] ?? null;
}
