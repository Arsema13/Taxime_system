import api from './api';

export interface UserSettings {
  emailNotifications?: boolean;
  taskAssignedNotification?: boolean;
  taskUpdatedNotification?: boolean;
  taskDueNotification?: boolean;
  commentMentionNotification?: boolean;
  theme?: string;
  dateFormat?: string;
  timeFormat?: string;
  profileVisibility?: string;
  showEmail?: boolean;
  showPhone?: boolean;
}

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await api.get('/settings');
    return data.data ?? data;
  },

  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    const { data } = await api.put('/settings', settings);
    return data.data ?? data;
  },
};
