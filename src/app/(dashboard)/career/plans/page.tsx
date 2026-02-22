import { Suspense } from 'react';
import CareerPlansClient from './client';

export const dynamic = 'force-dynamic';

export default function CareerPlansPage() {
    return (
        <Suspense fallback={
            <div className="max-w-2xl mx-auto py-10">
                <div className="space-y-4">
                    <div className="h-8 w-48 bg-qc-card rounded-xl animate-pulse" />
                    <div className="h-40 bg-qc-card rounded-2xl animate-pulse" />
                    <div className="h-32 bg-qc-card rounded-2xl animate-pulse" />
                </div>
                <p className="text-sm text-qc-muted text-center mt-6">Carregando...</p>
            </div>
        }>
            <CareerPlansClient />
        </Suspense>
    );
}
