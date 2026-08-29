import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class AuthSessionService {
  async getSessions(userId: string) {
    return prisma.userSession.findMany({
      where: { userId, isActive: true },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.userSession.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundError('Session not found');
    await prisma.userSession.update({ where: { id: sessionId }, data: { isActive: false } });
  }
}
