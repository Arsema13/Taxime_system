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
  primary:   'bg-[#e89b1a] text-[#0B1628] hover:bg-[#f4b728] shadow-md shadow-[#e89b1a]/20 active:scale-[0.98] font-bold',
  secondary: 'bg-white dark:bg-[#111d32] text-[#0B1628] dark:text-white hover:bg-[#F0F2F7] dark:hover:bg-white/5 border border-[#0B1628]/10 dark:border-white/10 shadow-xs active:scale-[0.98]',
  danger:    'bg-red-500 text-white hover:bg-red-600 shadow-sm active:scale-[0.98]',
  ghost:     'text-[#0B1628]/60 dark:text-white/60 hover:bg-[#0B1628]/5 dark:hover:bg-white/5 border border-transparent',
  outline:   'bg-transparent text-[#0B1628] dark:text-white hover:bg-white/80 dark:hover:bg-white/5 border border-[#0B1628]/20 dark:border-white/10 shadow-xs',
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
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/40 focus:ring-offset-2 dark:focus:ring-offset-[#0B1628]',
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
