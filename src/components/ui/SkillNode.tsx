'use client';

type SkillStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'evidenced';

interface SkillNodeProps {
    name: string;
    status: SkillStatus;
    xp: number;
    level: string;
    onClick?: () => void;
}

const STATUS_CONFIG: Record<SkillStatus, {
    border: string;
    bg: string;
    icon: string;
    clickable: boolean;
    extraClass: string;
}> = {
    locked: {
        border: 'border-white/5',
        bg: 'bg-qc-card',
        icon: '🔒',
        clickable: false,
        extraClass: 'opacity-40 cursor-not-allowed',
    },
    available: {
        border: 'border-qc-primary',
        bg: 'bg-qc-card',
        icon: '✨',
        clickable: true,
        extraClass: 'animate-pulse-border cursor-pointer hover:bg-qc-primary/5',
    },
    in_progress: {
        border: 'border-qc-secondary',
        bg: 'bg-qc-card',
        icon: '⏳',
        clickable: true,
        extraClass: 'cursor-pointer hover:bg-qc-secondary/5',
    },
    completed: {
        border: 'border-qc-success/30',
        bg: 'bg-qc-success/5',
        icon: '✅',
        clickable: true,
        extraClass: 'cursor-pointer',
    },
    evidenced: {
        border: 'border-qc-accent',
        bg: 'bg-qc-accent/10',
        icon: '⭐',
        clickable: true,
        extraClass: 'cursor-pointer',
    },
};

export function SkillNode({ name, status, xp, level, onClick }: SkillNodeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <button
            onClick={config.clickable ? onClick : undefined}
            disabled={!config.clickable}
            className={`w-full border rounded-xl p-3.5 text-center transition-all ${config.border} ${config.bg} ${config.extraClass}`}
        >
            <span className="text-base">{config.icon}</span>
            <p className="text-xs font-medium text-qc-text mt-1.5 truncate">{name}</p>
            <p className="text-[10px] text-qc-muted mt-0.5">{xp} XP</p>
            <span className="text-[9px] uppercase tracking-wider text-qc-muted/70">{level}</span>
        </button>
    );
}
