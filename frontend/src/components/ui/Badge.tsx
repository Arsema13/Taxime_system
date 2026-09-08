import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60',
  primary: 'bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 text-[#e89b1a] dark:text-[#e89b1a] border border-[#e89b1a]/20 dark:border-rose-800/50',
  success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50',
  warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-800/50',
  danger:  'bg-[#e89b1a]/5 dark:bg-[#e89b1a]/10 text-[#e89b1a] dark:text-[#e89b1a]/70 border border-[#e89b1a]/20 dark:border-rose-800/50',
  info:    'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-150 dark:border-sky-800/50',
  purple:  'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-150 dark:border-violet-800/50',
  orange:  'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-150 dark:border-orange-800/50',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-slate-400 dark:bg-slate-500',
  primary: 'bg-[#e89b1a]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-[#e89b1a]',
  info:    'bg-sky-500',
  purple:  'bg-violet-500',
  orange:  'bg-orange-500',
};

export function Badge({ variant = 'default', size = 'sm', dot = false, className = '', children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        VARIANTS[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[variant]}`} />}
      {children}
    </span>
  );
}
