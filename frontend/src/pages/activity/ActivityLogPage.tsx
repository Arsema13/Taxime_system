import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity, Filter, Search, Download, Calendar, User, Plus, RefreshCw,
  Trash2, BarChart3, MessageSquare, Paperclip, CheckSquare, ClipboardList, Shield
} from 'lucide-react';
import { activityService, userService } from '@/services';
import type { ActivityLog, PaginatedResponse, User as UserType } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar } from '@/components/ui/Avatar';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/contexts';
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ActivityFilters {
  search?: string;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

const ACTION_TYPES = [
  'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED',
  'TASK_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED',
  'COMMENT_ADDED', 'COMMENT_UPDATED', 'COMMENT_DELETED',
  'ATTACHMENT_ADDED', 'ATTACHMENT_DELETED',
  'SUBTASK_ADDED', 'SUBTASK_UPDATED', 'SUBTASK_DELETED',
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
];

type TabType = 'activity' | 'audit';

export default function ActivityLogPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [tab, setTab] = useState<TabType>('activity');

  // Activity state
  const [data, setData] = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ActivityFilters>({ page: 1, limit: 50 });

  // Audit state
  const [auditData, setAuditData] = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(true);

  const loadActivity = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const [activityRes, usersRes] = await Promise.all([
        activityService.getActivities(filters),
        userService.getUsers({ page: 1, limit: 100 }),
      ]);
      setData(activityRes);
      setUsers(usersRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await activityService.getAuditLog({ page: auditPage, limit: 25 });
      setAuditData(res);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage]);

  useEffect(() => { if (tab === 'activity') loadActivity(); }, [loadActivity, tab]);
  useEffect(() => { if (tab === 'audit') loadAudit(); }, [loadAudit, tab]);

  const handleExport = async () => {
    try {
      const blob = await activityService.exportActivities(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Exported', 'Activity log exported successfully');
    } catch {
      error('Error', 'Could not export activity log');
    }
  };

  const resetFilters = () => setFilters({ page: 1, limit: 50 });

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED'))    return <Plus size={12} />;
    if (action.includes('UPDATED'))    return <RefreshCw size={12} />;
    if (action.includes('DELETED'))    return <Trash2 size={12} />;
    if (action.includes('STATUS'))     return <BarChart3 size={12} />;
    if (action.includes('ASSIGNED'))   return <User size={12} />;
    if (action.includes('COMMENT'))    return <MessageSquare size={12} />;
    if (action.includes('ATTACHMENT')) return <Paperclip size={12} />;
    if (action.includes('SUBTASK'))    return <CheckSquare size={12} />;
    return <ClipboardList size={12} />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'success';
    if (action.includes('UPDATED')) return 'primary';
    if (action.includes('DELETED')) return 'danger';
    if (action.includes('STATUS'))  return 'warning';
    return 'default';
  };

  if (loadError && tab === 'activity') return <ErrorState message="Could not load activity log." onRetry={loadActivity} />;

  return (
    <div>
      <PageHeader
        title="Activity & Audit"
        description="Track all system activities and administrative actions"
        actions={
          tab === 'activity' ? (
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export</Button>
          ) : (
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadAudit} loading={auditLoading}>Refresh</Button>
          )
        }
      />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'activity'
              ? 'bg-[#e89b1a] text-[#0B1628]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Activity size={15} /> Activity Log
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            tab === 'audit'
              ? 'bg-[#e89b1a] text-[#0B1628]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Shield size={15} /> Audit Log
        </button>
      </div>

      {/* ── Activity Tab ── */}
      {tab === 'activity' && (
        <>
          <Card padding="md" className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search activities..."
                    value={filters.search ?? ''}
                    onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />} onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                {(filters.userId || filters.action || filters.startDate || filters.endDate) && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>Clear</Button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Select value={filters.userId ?? ''} onChange={e => setFilters(f => ({ ...f, userId: e.target.value || undefined, page: 1 }))}>
                    <option value="">All Users</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </Select>
                  <Select value={filters.action ?? ''} onChange={e => setFilters(f => ({ ...f, action: e.target.value || undefined, page: 1 }))}>
                    <option value="">All Actions</option>
                    {ACTION_TYPES.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                  </Select>
                  <Input type="date" value={filters.startDate ?? ''} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || undefined, page: 1 }))} />
                  <Input type="date" value={filters.endDate ?? ''} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || undefined, page: 1 }))} />
                </div>
              )}
            </div>
          </Card>

          {loading && !data ? (
            <PageLoader />
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-12 h-12" />}
              title="No activities found"
              description="Try adjusting your filters."
              action={<Button size="sm" onClick={resetFilters}>Clear Filters</Button>}
            />
          ) : (
            <>
              <Card padding="none">
                <div className="divide-y divide-slate-100">
                  {data.data.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="shrink-0 mt-0.5">{getActionIcon(activity.action)}</div>
                      <Avatar
                        src={activity.user?.avatar}
                        name={activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                            <span className="font-semibold text-slate-800">
                              {activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'}
                            </span>
                            {' '}
                            <span className="text-slate-600">{activity.action.toLowerCase().replace(/_/g, ' ')}</span>
                            {activity.taskTitle && (
                              <> <button onClick={() => activity.taskId && navigate(`/tasks/${activity.taskId}`)} className="text-teal-600 hover:underline font-medium">{activity.taskTitle}</button></>
                            )}
                          </p>
                          <Badge variant={getActionColor(activity.action) as any} className="shrink-0">
                            {activity.action.split('_')[0]}
                          </Badge>
                        </div>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3"><span className="font-medium">{key}:</span> {String(value)}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(activity.createdAt), 'PPp')}</span>
                          </div>
                          <span>·</span>
                          <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              {data?.pagination && (
                <div className="mt-6">
                  <Pagination
                    page={filters.page}
                    totalPages={data.pagination.totalPages}
                    total={data.pagination.total}
                    limit={filters.limit}
                    onPageChange={p => setFilters(f => ({ ...f, page: p }))}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Audit Tab ── */}
      {tab === 'audit' && (
        <>
          {auditLoading && !auditData ? <PageLoader /> : (
            <>
              <Table
                columns={[
                  { key: 'user', header: 'User', width: '200px', render: (r: ActivityLog) => (
                    <div className="flex items-center gap-2">
                      <Avatar src={r.user?.avatar} name={r.user ? `${r.user.firstName} ${r.user.lastName}` : 'System'} size="xs" />
                      <span className="text-sm font-medium">{r.user ? `${r.user.firstName} ${r.user.lastName}` : 'System'}</span>
                    </div>
                  )},
                  { key: 'action', header: 'Action', render: (r: ActivityLog) => (
                    <code className="text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-300">{r.action}</code>
                  )},
                  { key: 'time', header: 'Time', width: '180px', render: (r: ActivityLog) => (
                    <span title={format(new Date(r.createdAt), 'PPpp')} className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </span>
                  )},
                ]}
                data={auditData?.data ?? []}
                keyExtractor={(r) => r.id}
                loading={auditLoading}
                emptyMessage="No audit entries found."
              />
              {auditData && (
                <div className="mt-4">
                  <Pagination
                    page={auditPage}
                    totalPages={auditData.pagination.totalPages}
                    total={auditData.pagination.total}
                    limit={25}
                    onPageChange={setAuditPage}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
