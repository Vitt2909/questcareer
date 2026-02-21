'use client';

import { useState } from 'react';
import { ProgressRing } from './ProgressRing';

interface PathCardProps {
    title: string;
    estimatedMonths: number;
    topSkills: string[];
    adherencePercent: number;
    explanation: string;
}

export function PathCard({ title, estimatedMonths, topSkills, adherencePercent, explanation }: PathCardProps) {
    const [expanded, setExpanded] = useState(false);
    const truncated = explanation.length > 120;

    return (
        <div className="bg-qc-card border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-4">
                <ProgressRing percent={adherencePercent} size={56} color="var(--qc-secondary)" label="aderência" />
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-qc-text">{title}</h3>
                    <p className="text-xs text-qc-muted mt-0.5">~{estimatedMonths} meses estimados</p>
                </div>
            </div>

            {/* Top skills */}
            <div className="flex flex-wrap gap-1.5">
                {topSkills.map((skill) => (
                    <span key={skill} className="text-[10px] bg-qc-primary/10 text-qc-primary px-2 py-0.5 rounded-full">
                        {skill}
                    </span>
                ))}
            </div>

            {/* Explanation */}
            <div>
                <p className="text-xs text-qc-muted leading-relaxed">
                    {expanded || !truncated ? explanation : `${explanation.slice(0, 120)}...`}
                </p>
                {truncated && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-[11px] text-qc-primary mt-1 hover:underline"
                    >
                        {expanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                )}
            </div>
        </div>
    );
}
