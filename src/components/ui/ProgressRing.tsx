'use client';

interface ProgressRingProps {
    percent: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}

export function ProgressRing({
    percent,
    size = 64,
    strokeWidth = 5,
    color = 'var(--qc-primary)',
    label,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.min(Math.max(percent, 0), 100);
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-white/5"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-qc-text">
                    {clamped.toFixed(0)}%
                </span>
            </div>
            {label && <span className="text-[10px] text-qc-muted">{label}</span>}
        </div>
    );
}
