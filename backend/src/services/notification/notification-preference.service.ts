import prisma from '../../config/database';

export class NotificationPreferenceService {
  async getPreferences(userId: string) {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { startsWith: `notification_pref_${userId}` } },
    });
    const prefs: Record<string, string> = {};
    for (const s of settings) {
      const key = s.key.replace(`notification_pref_${userId}_`, '');
      prefs[key] = s.value;
    }
    return {
      emailEnabled: prefs.email !== 'false',
      deadlineReminders: prefs.deadlineReminders !== 'false',
      taskAssigned: prefs.taskAssigned !== 'false',
      comments: prefs.comments !== 'false',
      mentions: prefs.mentions !== 'false',
      statusChanges: prefs.statusChanges !== 'false',
    };
  }

  async updatePreferences(userId: string, preferences: Record<string, boolean>) {
    for (const [key, value] of Object.entries(preferences)) {
      await prisma.systemSetting.upsert({
        where: { key: `notification_pref_${userId}_${key}` },
        update: { value: String(value) },
        create: { key: `notification_pref_${userId}_${key}`, value: String(value) },
      });
    }
    return this.getPreferences(userId);
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
