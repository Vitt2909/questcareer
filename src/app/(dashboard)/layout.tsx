'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FeedbackButton } from '@/components/ui/FeedbackButton';

const NAV_ITEMS = [
    { href: '/', icon: '🏠', label: 'Início' },
    { href: '/skill-tree', icon: '🌳', label: 'Skill Tree' },
    { href: '/portfolio', icon: '🎖️', label: 'Portfólio' },
    { href: '/profile', icon: '👤', label: 'Perfil' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-qc-bg flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-60 border-r border-white/5 bg-qc-card/50 fixed inset-y-0 left-0 z-30">
                {/* Brand */}
                <div className="px-5 pt-6 pb-5">
                    <h1 className="text-base font-bold text-qc-text tracking-tight">
                        🎮 QuestCareer
                    </h1>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 space-y-0.5">
                    {NAV_ITEMS.map(({ href, icon, label }) => {
                        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active
                                        ? 'bg-qc-primary/10 text-qc-primary font-medium'
                                        : 'text-qc-muted hover:text-qc-text hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-base">{icon}</span>
                                {label}
                            </Link>
                        );
                    })}

                    {/* Career Plan link */}
                    <Link
                        href="/career/roles"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${pathname.startsWith('/career')
                                ? 'bg-qc-primary/10 text-qc-primary font-medium'
                                : 'text-qc-muted hover:text-qc-text hover:bg-white/5'
                            }`}
                    >
                        <span className="text-base">🗺️</span>
                        Plano de Carreira
                    </Link>
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/5">
                    <p className="text-[10px] text-qc-muted/50">QuestCareer Pilot v0.1</p>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-qc-bg/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-qc-primary/20 flex items-center justify-center text-sm font-bold text-qc-primary">
                            Q
                        </div>
                        <div>
                            <p className="text-sm font-medium text-qc-text">Aluno</p>
                            <p className="text-[10px] text-qc-muted">Nível 1</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-qc-accent/10 text-qc-accent px-2.5 py-1 rounded-full font-medium">
                            🔥 0 dias
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 px-4 md:px-6 py-6">
                    {children}
                </main>
            </div>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-qc-card/95 backdrop-blur-md border-t border-white/5 z-30">
                <div className="flex justify-around items-center py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                    {NAV_ITEMS.map(({ href, icon, label }) => {
                        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1 ${active ? 'text-qc-primary' : 'text-qc-muted'
                                    }`}
                            >
                                <span className="text-lg">{icon}</span>
                                <span className="text-[9px] font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Feedback button */}
            <FeedbackButton />
        </div>
    );
}
