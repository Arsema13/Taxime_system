import React, { useEffect } from 'react';
import { X, AlertTriangle, Check } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideClose?: boolean;
}

const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
};

export function Modal({ isOpen, onClose, title, description, size = 'md', children, footer, hideClose = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else        document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={[
          'relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-3xl shadow-2xl w-full animate-in flex flex-col max-h-[90vh] border border-white/40 dark:border-slate-700/50',
          SIZES[size],
        ].join(' ')}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-white/40 dark:border-slate-700/50 shrink-0">
            <div>
              {title && <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>}
              {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg p-1 hover:bg-white/40 dark:hover:bg-slate-700/50 shrink-0 mt-0.5"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 pb-5 pt-4 border-t border-white/40 dark:border-slate-700/50 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading = false,
}: ConfirmProps) {
  const colors = {
    danger:  'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white',
    primary: 'bg-teal-600 hover:bg-teal-700 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" hideClose>
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
          {variant === 'danger' ? (
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          ) : variant === 'warning' ? (
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          ) : (
            <Check className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-700/60 backdrop-blur-md border border-white/40 dark:border-slate-600/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${colors[variant]}`}
          >
            {loading ? 'Loading…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
