'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export default function SkillTreePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-6">Skill Tree</h1>
            <EmptyState
                icon="🌳"
                title="Skill Tree em branco"
                description="Escolha um caminho de carreira para ver sua skill tree."
                ctaLabel="Explorar carreiras"
                onCta={() => window.location.href = '/career/roles'}
            />
        </div>
    );
}
