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
  primary:   'bg-teal-600 text-white hover:bg-teal-700 shadow-sm border border-teal-600',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-600',
  ghost:     'text-slate-600 hover:bg-slate-100 border border-transparent',
  outline:   'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm border border-emerald-600',
};

const SIZES: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base gap-2 rounded-xl',
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
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1',
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
