'use client';

export default function ProfilePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-qc-text mb-6">Perfil</h1>
            <div className="bg-qc-card border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-qc-primary/20 flex items-center justify-center text-2xl font-bold text-qc-primary">
                        Q
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-qc-text">Aluno</h2>
                        <p className="text-sm text-qc-muted">Nível 1 · 0 XP</p>
                    </div>
                </div>
                <p className="text-xs text-qc-muted">
                    Configurações e edição de perfil serão implementadas após o onboarding.
                </p>
            </div>
        </div>
    );
}
