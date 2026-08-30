import React from 'react';
import type { TaskPriority } from '@/types';

interface Props {
  priority: TaskPriority;
  size?: 'sm' | 'md';
  iconOnly?: boolean;
}

const CONFIG: Record<TaskPriority, { label: string; classes: string; icon: string }> = {
  CRITICAL: { label: 'Critical', classes: 'bg-red-100 text-red-700',    icon: '🔴' },
  HIGH:     { label: 'High',     classes: 'bg-orange-100 text-orange-700', icon: '🟠' },
  MEDIUM:   { label: 'Medium',   classes: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
  LOW:      { label: 'Low',      classes: 'bg-green-100 text-green-700', icon: '🟢' },
};

export function TaskPriorityBadge({ priority, size = 'sm', iconOnly = false }: Props) {
  const cfg = CONFIG[priority] ?? CONFIG.LOW;
  if (iconOnly) {
    return (
      <span title={cfg.label} className="text-base leading-none select-none">
        {cfg.icon}
      </span>
    );
  }
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        cfg.classes,
      ].join(' ')}
    >
      <span className="text-xs leading-none">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
