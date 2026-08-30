import React from 'react';

interface TaskProgressProps {
  progress: number; // 0–100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

function getColor(p: number) {
  if (p >= 100) return 'bg-emerald-500';
  if (p >= 70)  return 'bg-teal-500';
  if (p >= 40)  return 'bg-amber-500';
  return 'bg-red-400';
}

const HEIGHTS = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function TaskProgress({ progress, size = 'md', showLabel = true, animated = true, className = '' }: TaskProgressProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 bg-slate-100 rounded-full overflow-hidden ${HEIGHTS[size]}`}>
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            getColor(clamped),
            animated ? 'transition-[width]' : '',
          ].join(' ')}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={`shrink-0 font-semibold tabular-nums ${size === 'sm' ? 'text-xs text-slate-500' : 'text-sm text-slate-700'}`}>
          {clamped}%
        </span>
      )}
    </div>
  );
}

// ── Inline circular mini progress ─────────────────────────────────────────────
export function CircularProgress({ progress, size = 36 }: { progress: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  const color = progress >= 100 ? '#10b981' : progress >= 70 ? '#14b8a6' : progress >= 40 ? '#f59e0b' : '#f87171';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}
