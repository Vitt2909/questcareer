'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'A senha precisa ter no mínimo 6 caracteres'),
});

const signupSchema = loginSchema.extend({
    name: z.string().min(2, 'Nome precisa ter no mínimo 2 caracteres'),
});

type FieldErrors = Record<string, string>;

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<FieldErrors>({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    // Consent modal
    const [showConsent, setShowConsent] = useState(false);
    const [termsAccepted] = useState(true); // Mandatory, always on
    const [notificationsAccepted, setNotificationsAccepted] = useState(false);

    const getSupabase = () => {
        try {
            return createClient();
        } catch {
            setGeneralError('Supabase não configurado. Configure as variáveis de ambiente.');
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

    const validate = () => {
        const schema = mode === 'signup' ? signupSchema : loginSchema;
        const result = schema.safeParse({ email, password, ...(mode === 'signup' ? { name } : {}) });
        if (!result.success) {
            const fieldErrors: FieldErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');
        if (!validate()) return;

        if (mode === 'signup') {
            setShowConsent(true);
            return;
        }

        // Login
        const supabase = getSupabase();
        if (!supabase) return;
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (error) {
            setGeneralError('Email ou senha incorretos.');
            return;
        }

        window.location.href = '/';
    };

    const handleSignupConfirm = async () => {
        if (!termsAccepted) return;
        const supabase = getSupabase();
        if (!supabase) return;
        setShowConsent(false);
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    name,
                    consent_flags: {
                        terms_accepted: true,
                        notifications_accepted: notificationsAccepted,
                        accepted_at: new Date().toISOString(),
                    },
                },
            },
        });

        setLoading(false);

        if (error) {
            setGeneralError('Algo deu errado. Tente novamente em instantes.');
            return;
        }

        setGeneralError('');
        setMode('login');
        setGeneralError('Conta criada! Verifique seu email para confirmar.');
    };

    return (
        <div className="min-h-screen bg-qc-bg flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-qc-text">🎮 QuestCareer</h1>
                    <p className="text-sm text-qc-muted mt-1">Seu RPG de carreira real</p>
                </div>

                {/* Card */}
                <div className="bg-qc-card border border-white/5 rounded-2xl p-6 space-y-5">
                    {/* Mode toggle */}
                    <div className="flex bg-qc-bg rounded-xl p-1">
                        <button
                            onClick={() => { setMode('login'); setErrors({}); setGeneralError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'login' ? 'bg-qc-primary text-white' : 'text-qc-muted hover:text-qc-text'
                                }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => { setMode('signup'); setErrors({}); setGeneralError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'signup' ? 'bg-qc-primary text-white' : 'text-qc-muted hover:text-qc-text'
                                }`}
                        >
                            Criar conta
                        </button>
                    </div>

                    {/* Google OAuth */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-2.5 bg-white text-gray-800 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-qc-card px-3 text-xs text-qc-muted">ou</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        {mode === 'signup' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nome completo"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-qc-bg border border-white/10 rounded-xl text-sm text-qc-text placeholder-qc-muted outline-none focus:border-qc-primary transition-colors"
                                />
                                {errors.name && (
                                    <p className="text-xs text-qc-danger mt-1 flex items-center gap-1">⚠️ {errors.name}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-qc-bg border border-white/10 rounded-xl text-sm text-qc-text placeholder-qc-muted outline-none focus:border-qc-primary transition-colors"
                            />
                            {errors.email && (
                                <p className="text-xs text-qc-danger mt-1 flex items-center gap-1">⚠️ {errors.email}</p>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-qc-bg border border-white/10 rounded-xl text-sm text-qc-text placeholder-qc-muted outline-none focus:border-qc-primary transition-colors"
                            />
                            {errors.password && (
                                <p className="text-xs text-qc-danger mt-1 flex items-center gap-1">⚠️ {errors.password}</p>
                            )}
                        </div>

                        {generalError && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${generalError.includes('criada') ? 'text-qc-success' : 'text-qc-danger'
                                }`}>
                                {generalError.includes('criada') ? '✅' : '⚠️'} {generalError}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-40 transition-colors"
                        >
                            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Consent Modal */}
            {showConsent && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowConsent(false)} />
                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-qc-card border border-white/10 rounded-2xl p-6 z-50 space-y-4">
                        <h3 className="text-base font-semibold text-qc-text">Antes de continuar</h3>

                        {/* Toggle 1 — mandatory */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="pt-0.5">
                                <div className="w-5 h-5 rounded bg-qc-primary flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <span className="text-sm text-qc-text leading-relaxed">
                                Li e aceito os <span className="text-qc-primary">Termos de Uso</span> e a{' '}
                                <span className="text-qc-primary">Política de Privacidade</span>
                            </span>
                        </label>

                        {/* Toggle 2 — optional */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <div className="pt-0.5">
                                <button
                                    onClick={() => setNotificationsAccepted(!notificationsAccepted)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notificationsAccepted
                                        ? 'bg-qc-primary border-qc-primary'
                                        : 'border-white/20 bg-transparent'
                                        }`}
                                >
                                    {notificationsAccepted && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <span className="text-sm text-qc-text leading-relaxed">
                                Aceito receber notificações de progresso por email
                            </span>
                        </label>

                        <button
                            onClick={handleSignupConfirm}
                            disabled={loading}
                            className="w-full py-2.5 bg-qc-primary text-white text-sm font-medium rounded-xl hover:bg-qc-primary/90 disabled:opacity-40 transition-colors"
                        >
                            {loading ? 'Criando conta...' : 'Continuar'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
