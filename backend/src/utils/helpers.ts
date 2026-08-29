import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { AuthUser } from '../types';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, config.jwt.secret) as AuthUser;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
}

export function parseDuration(duration: string): Date {
  const now = new Date();
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return new Date(now.getTime() + value * 1000);
    case 'm': return new Date(now.getTime() + value * 60 * 1000);
    case 'h': return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd': return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}
