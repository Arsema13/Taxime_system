import prisma from '../../config/database';
import { generateAccessToken, generateRefreshToken, parseDuration } from '../../utils/helpers';
import { config } from '../../config';
import { AuthUser } from '../../types';

export class TokenService {
  generateTokens(user: AuthUser) {
    return {
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user.id),
    };
  }

  async createRefreshToken(userId: string, token: string) {
    const expiresAt = parseDuration(config.jwt.refreshExpiresIn);
    return prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  }
}
