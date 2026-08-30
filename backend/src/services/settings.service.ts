import prisma from '../config/database';

export class SettingsService {
  // User settings
  async getUserSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updateUserSettings(userId: string, data: Partial<{
    emailNotifications: boolean;
    taskAssignedNotification: boolean;
    taskUpdatedNotification: boolean;
    taskDueNotification: boolean;
    commentMentionNotification: boolean;
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
  }>) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }

  // System settings (admin only)
  async getAll() {
    const settings = await prisma.systemSetting.findMany();
    return settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
  }

  async get(key: string) {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async set(key: string, value: string) {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMultiple(settings: Record<string, string>) {
    const operations = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await prisma.$transaction(operations);
  }
}

export const settingsService = new SettingsService();
