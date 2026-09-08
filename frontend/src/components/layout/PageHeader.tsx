import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-300 dark:text-slate-600" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-[#e89b1a] transition-colors truncate">{b.label}</Link>
                ) : (
                  <span className="text-slate-700 dark:text-slate-200 font-semibold truncate">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        {title && <h1 className="text-2xl sm:text-3xl font-black text-[#0B1628] dark:text-slate-100 tracking-tight truncate">{title}</h1>}
        {description && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}
