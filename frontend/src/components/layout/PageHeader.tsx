import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                {b.to ? (
                  <Link to={b.to} className="hover:text-teal-600 transition-colors truncate">{b.label}</Link>
                ) : (
                  <span className="text-slate-700 font-medium truncate">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight truncate">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
