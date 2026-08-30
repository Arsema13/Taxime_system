import React, { useEffect, useState } from 'react';
import { Activity, Filter, Search, Download, Calendar, User, Tag } from 'lucide-react';
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

export default function ActivityLogPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [data, setData] = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ActivityFilters>({ page: 1, limit: 50 });

  const load = async () => {
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
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

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

  const resetFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('CREATED')) return '✨';
    if (action.includes('UPDATED')) return '🔄';
    if (action.includes('DELETED')) return '🗑️';
    if (action.includes('STATUS')) return '📊';
    if (action.includes('ASSIGNED')) return '👤';
    if (action.includes('COMMENT')) return '💬';
    if (action.includes('ATTACHMENT')) return '📎';
    if (action.includes('SUBTASK')) return '☑️';
    return '📋';
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'success';
    if (action.includes('UPDATED')) return 'primary';
    if (action.includes('DELETED')) return 'danger';
    if (action.includes('STATUS')) return 'warning';
    return 'default';
  };

  if (loadError) return <ErrorState message="Could not load activity log." onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Activity Log"
        description="Track all system activities and changes"
        actions={
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        }
      />

      {/* Filters */}
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
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {(filters.userId || filters.action || filters.startDate || filters.endDate) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
              <Select
                value={filters.userId ?? ''}
                onChange={e => setFilters(f => ({ ...f, userId: e.target.value || undefined, page: 1 }))}
              >
                <option value="">All Users</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </Select>

              <Select
                value={filters.action ?? ''}
                onChange={e => setFilters(f => ({ ...f, action: e.target.value || undefined, page: 1 }))}
              >
                <option value="">All Actions</option>
                {ACTION_TYPES.map(action => (
                  <option key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>

              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate ?? ''}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || undefined, page: 1 }))}
              />

              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate ?? ''}
                onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || undefined, page: 1 }))}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Activity List */}
      {loading && !data ? (
        <PageLoader />
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-12 h-12" />}
          title="No activities found"
          description="Try adjusting your filters to see more activities."
          action={<Button size="sm" onClick={resetFilters}>Clear Filters</Button>}
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-slate-100">
              {Array.isArray(data?.data) && data.data.map(activity => (
                <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                  {/* Icon */}
                  <div className="text-2xl shrink-0 mt-0.5">
                    {getActionIcon(activity.action)}
                  </div>

                  {/* User Avatar */}
                  <Avatar
                    src={activity.user?.avatar}
                    name={activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'}
                    size="sm"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="text-sm text-slate-700 flex-1">
                        <span className="font-semibold text-slate-800">
                          {activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'}
                        </span>
                        {' '}
                        <span className="text-slate-600">
                          {activity.action.toLowerCase().replace(/_/g, ' ')}
                        </span>
                        {activity.taskTitle && (
                          <>
                            {' '}
                            <button
                              onClick={() => activity.taskId && navigate(`/tasks/${activity.taskId}`)}
                              className="text-teal-600 hover:underline font-medium"
                            >
                              {activity.taskTitle}
                            </button>
                          </>
                        )}
                      </p>
                      <Badge variant={getActionColor(activity.action) as any} className="shrink-0">
                        {activity.action.split('_')[0]}
                      </Badge>
                    </div>

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
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
    </div>
  );
}
