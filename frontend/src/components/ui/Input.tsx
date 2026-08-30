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
          <label className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            {...props}
            className={[
              'w-full rounded-lg border bg-white text-sm text-slate-800 placeholder:text-slate-400',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300',
              icon       ? 'pl-9'  : 'pl-3',
              iconRight  ? 'pr-9'  : 'pr-3',
              'py-2',
              props.disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : '',
              className,
            ].join(' ')}
          />
          {iconRight && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onIconRightClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {iconRight}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
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
          <label className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          {...props}
          className={[
            'w-full rounded-lg border bg-white text-sm text-slate-800 placeholder:text-slate-400 resize-y min-h-[80px]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 px-3 py-2',
            error ? 'border-red-400' : 'border-slate-300',
            props.disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
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
          <label className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          {...props}
          className={[
            'w-full rounded-lg border bg-white text-sm text-slate-800',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 px-3 py-2',
            error ? 'border-red-400' : 'border-slate-300',
            props.disabled ? 'bg-slate-50 opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options ? options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          )) : children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
