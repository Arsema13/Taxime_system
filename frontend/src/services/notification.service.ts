import api from './api';
import type { Notification, NotificationPreferences, PaginatedResponse } from '@/types';

export const notificationService = {
  async getNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<PaginatedResponse<Notification>> {
    const { data } = await api.get('/notifications', { params });
    return data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await api.get('/notifications/unread-count');
    return data.data ?? data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async clearAll(): Promise<void> {
    await api.delete('/notifications/clear-all');
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await api.get('/notifications/preferences');
    return data.data ?? data;
  },

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data } = await api.put('/notifications/preferences', prefs);
    return data.data ?? data;
  },
};
