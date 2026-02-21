'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';

const FEEDBACK_OPTIONS = [
    { type: 'attribute_disagree', label: 'Esse atributo não me representa' },
    { type: 'quest_too_hard', label: 'Quest difícil demais' },
    { type: 'quest_too_easy', label: 'Quest fácil demais' },
    { type: 'bug', label: 'Encontrei um bug' },
] as const;

export function FeedbackButton() {
    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [toast, setToast] = useState(false);

    const mutation = trpc.progress.submitFeedback.useMutation({
        onSuccess: () => {
            setContent('');
            setSelectedType(null);
            setOpen(false);
            setToast(true);
            setTimeout(() => setToast(false), 3000);
        },
    });

    const handleSubmit = () => {
        if (!selectedType || !content.trim()) return;
        mutation.mutate({
            type: selectedType as 'attribute_disagree' | 'quest_too_hard' | 'quest_too_easy' | 'bug' | 'general',
            content: content.trim(),
        });
    };

    return (
        <>
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-20 right-6 bg-qc-success/10 border border-qc-success/20 text-qc-success text-sm px-4 py-3 rounded-xl shadow-lg z-[60] animate-fade-in-scale">
                    ✅ Obrigado! Seu feedback foi registrado.
                </div>
            )}

            {/* Floating button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 w-12 h-12 bg-qc-primary hover:bg-qc-primary/90 rounded-full flex items-center justify-center text-white shadow-lg shadow-qc-primary/20 transition-all z-50 text-lg"
                    title="Enviar feedback"
                >
                    💬
                </button>
            )}

            {/* Modal */}
            {open && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => { setOpen(false); setSelectedType(null); }} />
                    <div className="fixed bottom-6 right-6 w-80 bg-qc-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 pt-4 pb-2">
                            <h4 className="text-sm font-semibold text-qc-text">
                                {selectedType ? 'Detalhes' : 'Feedback'}
                            </h4>
                            <button
                                onClick={() => { setOpen(false); setSelectedType(null); }}
                                className="text-qc-muted hover:text-qc-text text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Options or textarea */}
                        <div className="px-4 pb-4">
                            {!selectedType ? (
                                <div className="space-y-2">
                                    {FEEDBACK_OPTIONS.map(({ type, label }) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-qc-text bg-white/5 hover:bg-qc-primary/10 hover:text-qc-primary transition-colors"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setSelectedType(null)}
                                        className="text-xs text-qc-muted hover:text-qc-text"
                                    >
                                        ← Voltar
                                    </button>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Conte mais..."
                                        rows={4}
                                        className="w-full px-3 py-2.5 bg-qc-bg border border-white/10 rounded-xl text-sm text-qc-text placeholder-qc-muted resize-none outline-none focus:border-qc-primary"
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!content.trim() || mutation.isPending}
                                        className="w-full py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-40 transition-colors"
                                    >
                                        {mutation.isPending ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
