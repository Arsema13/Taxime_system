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
        'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm',
        PADDING[padding],
        hover ? 'transition-shadow hover:shadow-md cursor-pointer' : '',
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
  trend?: { value: number; label: string; up?: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, iconBg = 'bg-teal-100', trend, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBg} dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </Card>
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
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500">
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
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">Error</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-2 rounded-lg bg-teal-600 dark:bg-teal-500 text-white text-sm font-medium hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
