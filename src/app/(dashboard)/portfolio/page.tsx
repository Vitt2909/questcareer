'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export default function PortfolioPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-6">Portfólio</h1>
            <EmptyState
                icon="📁"
                title="Nenhuma evidência ainda"
                description="Complete uma quest para adicionar evidências ao seu portfólio."
            />
        </div>
    );
}
