import React, { useEffect, useState } from 'react';
import { Check, CheckCheck, Trash2, Bell, BellOff, Filter, RefreshCw } from 'lucide-react';
import { notificationService } from '@/services';
import type { Notification, PaginatedResponse } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Input';
import { useToast, useNotifications } from '@/contexts';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotificationFilters {
  unreadOnly?: boolean;
  page: number;
  limit: number;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { refreshNotifications } = useNotifications();

  const [data, setData] = useState<PaginatedResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filters, setFilters] = useState<NotificationFilters>({ page: 1, limit: 20 });

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const res = await notificationService.getNotifications(filters);
      setData(res);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const handleMarkRead = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.markAsRead(id);
      load();
      refreshNotifications();
    } catch {
      error('Error', 'Could not mark as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await notificationService.markAllAsRead();
      success('Success', 'All notifications marked as read');
      load();
      refreshNotifications();
    } catch {
      error('Error', 'Could not mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.deleteNotification(id);
      success('Deleted', 'Notification deleted');
      load();
      refreshNotifications();
    } catch {
      error('Error', 'Could not delete notification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification.id);
    }
    if (notification.relatedTaskId) {
      navigate(`/tasks/${notification.relatedTaskId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return '📋';
      case 'TASK_UPDATED': return '🔄';
      case 'TASK_COMPLETED': return '✅';
      case 'DEADLINE_REMINDER': return '⏰';
      case 'COMMENT_ADDED': return '💬';
      case 'TASK_OVERDUE': return '⚠️';
      case 'TASK_ESCALATED': return '🚨';
      case 'MENTION': return '@';
      default: return '🔔';
    }
  };

  if (loadError) return <ErrorState message="Could not load notifications." onRetry={load} />;

  const unreadCount = data?.data.filter(n => !n.isRead).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with your task activities"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={load}
              loading={loading}
            >
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={<CheckCheck className="w-4 h-4" />}
                onClick={handleMarkAllRead}
                loading={actionLoading === 'all'}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={filters.unreadOnly ? 'unread' : 'all'}
              onChange={e => {
                setFilters(f => ({
                  ...f,
                  unreadOnly: e.target.value === 'unread',
                  page: 1
                }));
              }}
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
            </Select>
          </div>

          {unreadCount > 0 && (
            <Badge variant="primary">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </Card>

      {/* Content */}
      {loading && !data ? (
        <PageLoader />
      ) : !data?.data || data.data.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="No notifications"
          description={
            filters.isRead === false
              ? "You're all caught up! No unread notifications."
              : filters.isRead === true
                ? "No read notifications to show."
                : "You don't have any notifications yet."
          }
        />
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y divide-slate-100">
              {Array.isArray(data?.data) && data.data.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 ${
                    !notification.isRead ? 'bg-teal-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="text-2xl shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`${notification.relatedTaskId ? 'cursor-pointer' : ''}`}
                      onClick={() => notification.relatedTaskId && handleNotificationClick(notification)}
                    >
                      <p className={`text-sm mb-1 ${!notification.isRead ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        {!notification.isRead && (
                          <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Check className="w-4 h-4" />}
                        onClick={() => handleMarkRead(notification.id)}
                        loading={actionLoading === notification.id}
                        title="Mark as read"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDelete(notification.id)}
                      loading={actionLoading === notification.id}
                      title="Delete"
                    />
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
