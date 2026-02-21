'use client';

import { motion } from 'framer-motion';

interface XPBarProps {
    currentXP: number;
    maxXP: number;
    level: number;
    label?: string;
}

export function XPBar({ currentXP, maxXP, level, label }: XPBarProps) {
    const percent = maxXP > 0 ? Math.min((currentXP / maxXP) * 100, 100) : 0;

    return (
        <div className="space-y-1.5">
            {label && (
                <span className="text-xs font-medium text-qc-muted uppercase tracking-wider">
                    {label}
                </span>
            )}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-qc-card rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: 'var(--qc-accent)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>
            <p className="text-xs text-qc-muted">
                Nível {level} · {currentXP.toLocaleString('pt-BR')}/{maxXP.toLocaleString('pt-BR')} XP
            </p>
        </div>
    );
}
