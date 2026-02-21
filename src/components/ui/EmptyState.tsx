'use client';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    ctaLabel?: string;
    onCta?: () => void;
}

export function EmptyState({ icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
    return (
        <div className="text-center py-16 px-4">
            <span className="text-5xl">{icon}</span>
            <h3 className="text-base font-semibold text-qc-text mt-5">{title}</h3>
            <p className="text-sm text-qc-muted mt-2 max-w-xs mx-auto leading-relaxed">
                {description}
            </p>
            {ctaLabel && onCta && (
                <button
                    onClick={onCta}
                    className="mt-5 px-5 py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 transition-colors"
                >
                    {ctaLabel}
                </button>
            )}
        </div>
    );
}
