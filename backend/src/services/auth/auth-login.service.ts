import prisma from '../../config/database';
import { comparePasswords, verifyRefreshToken } from '../../utils/helpers';
import { UnauthorizedError } from '../../utils/errors';
import { AuthUser } from '../../types';
import { activityService } from '../activity.service';
import { TokenService } from './auth-token.service';

const tokenService = new TokenService();

export class AuthLoginService {
  async login(email: string, password: string, ip?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.status !== 'ACTIVE') throw new UnauthorizedError('Account is not active');

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const session = await prisma.userSession.create({
      data: { userId: user.id, ip, userAgent },
    });

    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
    const tokens = tokenService.generateTokens(authUser);

    await tokenService.createRefreshToken(user.id, tokens.refreshToken);

    await activityService.auditLog({
      userId: user.id, action: 'LOGIN', entity: 'User',
      entityId: user.id, ip,
    });

    return { user: authUser, ...tokens, sessionId: session.id };
  }

  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const storedToken = await prisma.refreshToken.findUnique({ where: { token } });

      if (!storedToken || storedToken.expiresAt < new Date() || storedToken.userId !== decoded.id) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status !== 'ACTIVE') throw new UnauthorizedError('User not found or inactive');

      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const authUser: AuthUser = { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
      const tokens = tokenService.generateTokens(authUser);
      await tokenService.createRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(userId: string, sessionId?: string) {
    if (sessionId) {
      await prisma.userSession.updateMany({ where: { id: sessionId, userId }, data: { isActive: false } });
    }
    await prisma.refreshToken.deleteMany({ where: { userId } });

    await activityService.auditLog({
      userId, action: 'LOGOUT', entity: 'User', entityId: userId,
    });
  }
}
