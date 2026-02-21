'use client';

import { useState } from 'react';

interface AttributeCardProps {
    name: string;
    icon: string;
    value: number; // 0–100
    description: string;
    isProvisional: boolean;
}

export function AttributeCard({ name, icon, value, description, isProvisional }: AttributeCardProps) {
    const [showTooltip, setShowTooltip] = useState(false);
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedValue / 100) * circumference;

    return (
        <div className="animate-fade-in-scale bg-qc-card border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-3 relative">
            {/* Provisional badge */}
            {isProvisional && (
                <div className="absolute top-3 right-3 relative">
                    <button
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="text-[10px] font-medium bg-qc-accent/20 text-qc-accent px-2 py-0.5 rounded-full"
                    >
                        Em calibração
                    </button>
                    {showTooltip && (
                        <div className="absolute top-full right-0 mt-1 w-52 bg-qc-bg border border-white/10 text-xs text-qc-muted p-2.5 rounded-lg shadow-xl z-10">
                            Complete mais quests para confirmar este atributo
                        </div>
                    )}
                </div>
            )}

            {/* SVG Gauge */}
            <div className="relative w-24 h-24">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-white/5"
                        strokeWidth="6"
                    />
                    <circle
                        cx="40" cy="40" r={radius}
                        fill="none"
                        stroke="var(--qc-primary)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-bold text-qc-text">{clampedValue}</span>
                </div>
            </div>

            {/* Info */}
            <h4 className="text-sm font-semibold text-qc-text">{name}</h4>
            <p className="text-xs text-qc-muted text-center leading-relaxed">{description}</p>
        </div>
    );
}
