'use client';

type ContentType = 'youtube' | 'external_course' | 'external_article' | 'external_exercise';
type QuestStatus = 'pending' | 'active' | 'complete' | 'skipped';

interface QuestCardProps {
    questId?: string;
    title: string;
    description: string;
    resourceUrl?: string;
    estimatedMinutes: number;
    xpReward: number;
    status: QuestStatus;
    contentType: ContentType;
    platformName?: string;
    platformLogoUrl?: string;
}

const CONTENT_BADGES: Record<ContentType, { emoji: string; label: (p?: string) => string }> = {
    youtube: { emoji: '🎬', label: () => 'Assiste aqui no app' },
    external_course: { emoji: '🎓', label: (p) => `Curso com certificado — ${p ?? 'Plataforma'}` },
    external_article: { emoji: '📄', label: () => 'Artigo — abre em nova aba' },
    external_exercise: { emoji: '💻', label: () => 'Exercício — abre em nova aba' },
};

const STATUS_STYLES: Record<QuestStatus, string> = {
    pending: 'border-qc-muted/30',
    active: 'border-qc-primary animate-pulse-border',
    complete: 'border-qc-success/40 bg-qc-success/5',
    skipped: 'border-white/5 opacity-50',
};

export function QuestCard({
    questId,
    title,
    description,
    resourceUrl,
    estimatedMinutes,
    xpReward,
    status,
    contentType,
    platformName,
    platformLogoUrl,
}: QuestCardProps) {
    const badge = CONTENT_BADGES[contentType];
    const isExternal = contentType === 'external_article' || contentType === 'external_exercise';

    const handleClick = () => {
        if (status === 'complete' || status === 'skipped') return;
        if (isExternal && resourceUrl) {
            window.open(resourceUrl, '_blank', 'noopener');
        }
    };

    const ctaHref = isExternal ? undefined : questId ? `/quest/${questId}` : undefined;
    const ctaLabel = isExternal ? 'Acessar ↗' : 'Abrir Quest';

    return (
        <div className={`bg-qc-card border rounded-2xl p-5 transition-all ${STATUS_STYLES[status]}`}>
            {/* Content type badge */}
            <div className="flex items-center gap-1.5 mb-3">
                {platformLogoUrl ? (
                    <img src={platformLogoUrl} alt={platformName ?? ''} className="w-4 h-4 rounded-sm object-contain" />
                ) : (
                    <span className="text-xs">{badge.emoji}</span>
                )}
                <span className="text-[11px] text-qc-muted">{badge.label(platformName)}</span>
            </div>

            {/* Title & description */}
            <h3 className="text-sm font-semibold text-qc-text">{title}</h3>
            <p className="text-xs text-qc-muted mt-1 line-clamp-2 leading-relaxed">{description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-3 text-[11px] text-qc-muted">
                <span>⏱ {estimatedMinutes}min</span>
                <span>⭐ {xpReward} XP</span>
            </div>

            {/* CTA */}
            {status !== 'complete' && status !== 'skipped' && (
                <div className="mt-4">
                    {isExternal ? (
                        <button
                            onClick={handleClick}
                            className="text-xs font-medium px-4 py-2 rounded-lg bg-qc-primary/10 text-qc-primary hover:bg-qc-primary/20 transition-colors"
                        >
                            {ctaLabel}
                        </button>
                    ) : (
                        <a
                            href={ctaHref}
                            className="inline-block text-xs font-medium px-4 py-2 rounded-lg bg-qc-primary text-white hover:bg-qc-primary/90 transition-colors"
                        >
                            {ctaLabel}
                        </a>
                    )}
                </div>
            )}

            {/* Completed indicator */}
            {status === 'complete' && (
                <div className="mt-3 flex items-center gap-1.5 text-qc-success text-xs font-medium">
                    ✅ Concluída
                </div>
            )}
        </div>
    );
}
