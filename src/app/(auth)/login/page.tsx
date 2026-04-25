'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup';

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const getSupabase = () => {
        try {
            return createClient();
        } catch {
            setMessage('Supabase nao configurado. Configure as variaveis de ambiente.');
            return null;
        }
    };

    const handleGoogleLogin = async () => {
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage('');

        if (!email || password.length < 6 || (mode === 'signup' && name.trim().length < 2)) {
            setMessage('Preencha email, senha e nome quando for criar conta.');
            return;
        }

        const supabase = getSupabase();
        if (!supabase) return;

        setLoading(true);

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: { name },
                },
            });

            setLoading(false);

            if (error) {
                setMessage('Nao foi possivel criar a conta agora.');
                return;
            }

            setMode('login');
            setMessage('Conta criada. Verifique seu email para confirmar o acesso.');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            setMessage('Email ou senha incorretos.');
            return;
        }

        window.location.href = '/dashboard';
    };

    return (
        <main className="min-h-screen bg-qc-bg px-4 py-10 text-qc-text">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
                <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                    <section>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-qc-secondary">
                            QuestCareer
                        </p>
                        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                            Entre para continuar sua trilha de carreira.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-qc-muted">
                            O painel organiza diagnostico, quests, portfolio e progresso semanal em
                            uma rotina simples para estudantes decidirem com mais clareza.
                        </p>
                    </section>

                    <section className="rounded-3xl border border-white/10 bg-qc-card p-6 shadow-2xl shadow-black/20">
                        <div className="mb-5 flex rounded-2xl bg-qc-bg p-1">
                            <button
                                type="button"
                                onClick={() => { setMode('login'); setMessage(''); }}
                                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-qc-primary text-white' : 'text-qc-muted hover:text-qc-text'}`}
                            >
                                Entrar
                            </button>
                            <button
                                type="button"
                                onClick={() => { setMode('signup'); setMessage(''); }}
                                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-qc-primary text-white' : 'text-qc-muted hover:text-qc-text'}`}
                            >
                                Criar conta
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="mb-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                        >
                            Continuar com Google
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {mode === 'signup' && (
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-qc-bg px-4 py-3 text-sm outline-none transition placeholder:text-qc-muted focus:border-qc-primary"
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-qc-bg px-4 py-3 text-sm outline-none transition placeholder:text-qc-muted focus:border-qc-primary"
                            />
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-qc-bg px-4 py-3 text-sm outline-none transition placeholder:text-qc-muted focus:border-qc-primary"
                            />

                            {message && (
                                <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-5 text-qc-muted">
                                    {message}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-qc-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-qc-primary/90 disabled:opacity-50"
                            >
                                {loading ? 'Processando...' : mode === 'login' ? 'Entrar no painel' : 'Criar conta'}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}
