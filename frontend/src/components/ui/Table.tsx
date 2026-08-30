import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function Table<T>({
  columns, data, keyExtractor, loading = false, emptyMessage = 'No data found.',
  onRowClick, sortKey, sortOrder, onSort,
}: TableProps<T>) {
  // Safety checks
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {safeColumns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={[
                  'px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide',
                  col.sortable ? 'cursor-pointer select-none hover:text-slate-700' : '',
                ].join(' ')}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    <span className="text-teal-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                {safeColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : safeData.length === 0 ? (
            <tr>
              <td colSpan={safeColumns.length} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={[
                  'border-b border-slate-100 last:border-0 transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : '',
                ].join(' ')}
              >
                {safeColumns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-700">
                    {col.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
