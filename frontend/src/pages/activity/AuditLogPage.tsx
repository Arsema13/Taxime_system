import React, { useEffect, useState, useCallback } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { activityService } from '@/services';
import type { ActivityLog, PaginatedResponse } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar } from '@/components/ui/Avatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow, format } from 'date-fns';

export default function AuditLogPage() {
  const [data,    setData]    = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityService.getAuditLog({ page, limit: 25 });
      setData(res);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Security-sensitive and administrative actions"
        actions={<Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load} loading={loading}>Refresh</Button>}
      />

      {loading && !data ? <PageLoader /> : (
        <>
          <Table
            columns={[
              { key: 'user',   header: 'User',   width: '200px', render: (r: ActivityLog) => (
                <div className="flex items-center gap-2">
                  <Avatar src={r.user.avatar} name={`${r.user.firstName} ${r.user.lastName}`} size="xs" />
                  <span className="text-sm font-medium">{r.user.firstName} {r.user.lastName}</span>
                </div>
              )},
              { key: 'action', header: 'Action', render: (r: ActivityLog) => (
                <code className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-700">{r.action}</code>
              )},
              { key: 'time',   header: 'Time',   width: '180px', render: (r: ActivityLog) => (
                <span title={format(new Date(r.createdAt), 'PPpp')} className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              )},
            ]}
            data={data?.data ?? []}
            keyExtractor={(r) => r.id}
            loading={loading}
            emptyMessage="No audit entries found."
          />
          {data && (
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                total={data.pagination.total}
                limit={25}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
