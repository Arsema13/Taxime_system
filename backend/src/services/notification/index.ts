import { notificationQueryService } from './notification-query.service';
import { notificationMutateService } from './notification-mutate.service';
import { notificationPreferenceService } from './notification-preference.service';

export class NotificationService {
  async findByUser(userId: string, unreadOnly = false) {
    return notificationQueryService.findByUser(userId, unreadOnly);
  }

  async getUnreadCount(userId: string) {
    return notificationQueryService.getUnreadCount(userId);
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    taskId?: string;
    actorId?: string;
    link?: string;
  }) {
    return notificationMutateService.create(data);
  }

  async markAsRead(notificationId: string, userId: string) {
    return notificationMutateService.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string) {
    return notificationMutateService.markAllAsRead(userId);
  }

  async delete(notificationId: string, userId: string) {
    return notificationMutateService.delete(notificationId, userId);
  }

  async getPreferences(userId: string) {
    return notificationPreferenceService.getPreferences(userId);
  }

  async updatePreferences(userId: string, preferences: Record<string, boolean>) {
    return notificationPreferenceService.updatePreferences(userId, preferences);
  }
}

export const notificationService = new NotificationService();
