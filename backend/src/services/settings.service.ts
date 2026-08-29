import prisma from '../config/database';

export class SettingsService {
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
