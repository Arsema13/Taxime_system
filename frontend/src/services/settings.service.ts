import api from './api';

export interface UserSettings {
  notifications?: {
    taskAssigned?: boolean;
    taskCompleted?: boolean;
    taskOverdue?: boolean;
    commentAdded?: boolean;
    mentionReceived?: boolean;
    statusChanged?: boolean;
  };
  appearance?: {
    theme?: string;
    defaultView?: string;
  };
  preferences?: {
    language?: string;
    timezone?: string;
    dateFormat?: string;
    timeFormat?: string;
  };
  privacy?: {
    showOnlineStatus?: boolean;
    allowTaskInvitations?: boolean;
  };
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
