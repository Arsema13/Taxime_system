import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   'bg-[#FF4D67] text-white hover:bg-[#E83D58] shadow-md shadow-red-500/20 active:scale-[0.98]',
  secondary: 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-slate-600/80 shadow-xs active:scale-[0.98]',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[0.98]',
  ghost:     'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 border border-transparent',
  outline:   'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/50 border border-slate-300 dark:border-slate-600 shadow-xs',
  success:   'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm active:scale-[0.98]',
};

const SIZES: Record<Size, string> = {
  xs: 'px-3 py-1 text-xs gap-1 rounded-full',
  sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 rounded-full',
  md: 'px-5 py-2.5 text-sm font-semibold gap-2 rounded-full',
  lg: 'px-6 py-3 text-base font-semibold gap-2.5 rounded-full',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF4D67]/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
        className,
      ].join(' ')}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
