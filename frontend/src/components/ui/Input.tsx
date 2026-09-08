import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  onIconRightClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, onIconRightClick, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            className={[
              'w-full rounded-2xl border bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs',
              'transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a]',
              error ? 'border-[#e89b1a] focus:ring-[#e89b1a]/20' : 'border-slate-200/80 dark:border-slate-600/80',
              icon       ? 'pl-10' : 'pl-4',
              iconRight  ? 'pr-10' : 'pr-4',
              'py-2.5',
              props.disabled ? 'bg-slate-50 dark:bg-[#0B1628] opacity-60 cursor-not-allowed' : '',
              className,
            ].join(' ')}
          />
          {iconRight && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onIconRightClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {iconRight}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Textarea ──────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          {...props}
          className={[
            'w-full rounded-xl border bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-y min-h-[80px]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a] px-3 py-2',
            error ? 'border-red-400' : 'border-white/40 dark:border-slate-600/60',
            props.disabled ? 'bg-slate-50 dark:bg-[#0B1628] opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className = '', children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          {...props}
          className={[
            'w-full rounded-xl border bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-sm text-slate-800 dark:text-slate-200',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#e89b1a]/20 focus:border-[#e89b1a] px-3 py-2',
            error ? 'border-red-400' : 'border-white/40 dark:border-slate-600/60',
            props.disabled ? 'bg-slate-50 dark:bg-[#0B1628] opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options ? options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          )) : children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
