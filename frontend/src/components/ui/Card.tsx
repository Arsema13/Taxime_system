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
        'bg-white/40 backdrop-blur-md rounded-3xl border border-white/40 shadow-sm',
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

export function StatCard({ label, value, icon, iconBg = 'bg-white', trend, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-slate-800">{value}</span>
            {trend && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${trend.up ? 'bg-lime-300 text-slate-800' : 'bg-red-100 text-red-600'}`}>
                {trend.up ? '+' : ''}{trend.value}% {trend.label}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">{label}</p>
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
        <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 border border-white/40">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {description && <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>}
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
      <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/40">
        <span className="text-3xl">⚠️</span>
      </div>
      <div>
        <p className="font-semibold text-slate-700">Error</p>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
