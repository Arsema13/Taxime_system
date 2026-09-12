import React, { useEffect, useState } from 'react';
import { Check, CheckCheck, Trash2, Bell, RefreshCw, ClipboardList, CheckCircle, Clock, MessageSquare, AlertTriangle, AtSign, UserPlus } from 'lucide-react';
import { notificationService } from '@/services';
import type { Notification } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, EmptyState, ErrorState } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { useToast, useNotifications } from '@/contexts';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { refreshNotifications } = useNotifications();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const res = await notificationService.getNotifications({ unreadOnly });
      // backend returns plain array wrapped in data
      const list = Array.isArray(res) ? res : (res as any).data ?? [];
      setNotifications(list);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [unreadOnly]);

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
    if (!notification.isRead) handleMarkRead(notification.id);
    if (notification.link) navigate(notification.link);
    else if (notification.taskId) navigate(`/tasks/${notification.taskId}`);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return <ClipboardList size={14} />;
      case 'TASK_UPDATED': return <RefreshCw size={14} />;
      case 'TASK_COMPLETED': return <CheckCircle size={14} />;
      case 'DEADLINE_REMINDER': return <Clock size={14} />;
      case 'COMMENT_ADDED': return <MessageSquare size={14} />;
      case 'TASK_OVERDUE': return <AlertTriangle size={14} />;
      case 'TASK_ESCALATED': return <AlertTriangle size={14} />;
      case 'MENTION': return <AtSign size={14} />;
      case 'NEW_USER_REGISTERED': return <UserPlus size={14} />;
      default: return <Bell size={14} />;
    }
  };

  if (loadError) return <ErrorState message="Could not load notifications." onRetry={load} />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with your task activities"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={load} loading={loading}>
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={handleMarkAllRead} loading={actionLoading === 'all'}>
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between">
          <Select value={unreadOnly ? 'unread' : 'all'} onChange={e => setUnreadOnly(e.target.value === 'unread')}>
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </Select>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount} unread</Badge>}
        </div>
      </Card>

      {loading && notifications.length === 0 ? (
        <PageLoader />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="No notifications"
          description={unreadOnly ? "You're all caught up!" : "You don't have any notifications yet."}
        />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-slate-100">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${!notification.isRead ? 'bg-teal-50/30' : ''}`}
              >
                <div className="text-2xl shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div
                    className={(notification.link || notification.taskId) ? 'cursor-pointer' : ''}
                    onClick={() => (notification.link || notification.taskId) && handleNotificationClick(notification)}
                  >
                    <p className={`text-sm mb-1 ${!notification.isRead ? 'font-semibold text-slate-800' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      {!notification.isRead && <Badge variant="primary" className="text-[10px] px-1.5 py-0.5">New</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!notification.isRead && (
                    <Button variant="ghost" size="sm" icon={<Check className="w-4 h-4" />} onClick={() => handleMarkRead(notification.id)} loading={actionLoading === notification.id} title="Mark as read" />
                  )}
                  <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(notification.id)} loading={actionLoading === notification.id} title="Delete" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
