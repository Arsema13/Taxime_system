import React from 'react';
import type { TaskStatus } from '@/types';

interface Props {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<TaskStatus, { label: string; classes: string; dot: string }> = {
  DRAFT:                 { label: 'Draft',           classes: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  PENDING:               { label: 'Pending',         classes: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  ACCEPTED:              { label: 'Accepted',        classes: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500' },
  IN_PROGRESS:           { label: 'In Progress',     classes: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  SUBMITTED_FOR_REVIEW:  { label: 'Submitted',       classes: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-500' },
  UNDER_REVIEW:          { label: 'Under Review',    classes: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  COMPLETED:             { label: 'Completed',       classes: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  REJECTED:              { label: 'Rejected',        classes: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  ON_HOLD:               { label: 'On Hold',         classes: 'bg-slate-200 text-slate-600',    dot: 'bg-slate-500' },
  CANCELLED:             { label: 'Cancelled',       classes: 'bg-slate-100 text-slate-500',    dot: 'bg-slate-400' },
  OVERDUE:               { label: 'Overdue',         classes: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
};

export function TaskStatusBadge({ status, size = 'sm' }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.DRAFT;
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        cfg.classes,
      ].join(' ')}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
