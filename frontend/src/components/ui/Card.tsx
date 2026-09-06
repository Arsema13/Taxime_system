import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const PADDING = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-slate-800 rounded-[24px] border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)]',
        PADDING[padding],
        hover ? 'transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-0.5 cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: number | string; label?: string; up?: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, iconBg = 'bg-slate-50 dark:bg-slate-700', trend, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-[24px] p-5 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)] flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">{value}</p>
        </div>
      </div>
      {trend && (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          trend.up ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
        }`}>
          {trend.up ? `+${trend.value}% ↗` : `-${trend.value}% ↘`}
        </span>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="w-16 h-16 bg-white/40 dark:bg-slate-700/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 border border-white/40 dark:border-slate-600/50">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-teal-100 dark:border-teal-800">
        <svg className="w-8 h-8 text-teal-700 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Error</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-medium hover:bg-teal-800 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
