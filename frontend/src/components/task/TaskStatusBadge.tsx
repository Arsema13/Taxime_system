import React from 'react';
import type { TaskStatus } from '@/types';

interface Props {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<TaskStatus, { label: string; classes: string; dot: string }> = {
  DRAFT:                 { label: 'Draft',           classes: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60',       dot: 'bg-slate-400 dark:bg-slate-500' },
  PENDING:               { label: 'Pending',         classes: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/50',              dot: 'bg-sky-500' },
  ACCEPTED:              { label: 'Accepted',        classes: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/50',    dot: 'bg-indigo-500' },
  IN_PROGRESS:           { label: 'In Transit',      classes: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/50',              dot: 'bg-sky-500' },
  SUBMITTED_FOR_REVIEW:  { label: 'Review Ready',    classes: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200/80 dark:border-purple-800/50',    dot: 'bg-purple-500' },
  UNDER_REVIEW:          { label: 'Under Review',    classes: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/50',    dot: 'bg-violet-500' },
  COMPLETED:             { label: 'Delivered',       classes: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/50',  dot: 'bg-emerald-500' },
  REJECTED:              { label: 'Issue Reported',  classes: 'bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 text-[#e89b1a] dark:text-[#e89b1a]/70 border border-[#e89b1a]/20 dark:border-rose-800/50',          dot: 'bg-[#e89b1a]' },
  ON_HOLD:               { label: 'Waiting Courier', classes: 'bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 text-[#e89b1a] dark:text-[#e89b1a]/70 border border-[#e89b1a]/20 dark:border-rose-800/50',          dot: 'bg-[#e89b1a]/70' },
  CANCELLED:             { label: 'Cancelled',       classes: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-600/60',       dot: 'bg-slate-400 dark:bg-slate-500' },
  OVERDUE:               { label: 'Delayed',         classes: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/80 dark:border-red-800/50',             dot: 'bg-red-500' },
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
