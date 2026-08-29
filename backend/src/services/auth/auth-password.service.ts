import prisma from '../../config/database';
import { hashPassword, comparePasswords } from '../../utils/helpers';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { emailService } from '../email.service';

export class AuthPasswordService {
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If your email exists, a reset link has been sent' };

    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordReset.create({ data: { token, userId: user.id, expiresAt } });

    await emailService.sendPasswordReset(user.email, token);

    return { message: 'If your email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await prisma.passwordReset.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } });
    await prisma.passwordReset.update({ where: { id: resetToken.id }, data: { used: true } });
    await prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const isValid = await comparePasswords(currentPassword, user.password);
    if (!isValid) throw new BadRequestError('Current password is incorrect');

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { message: 'Password changed successfully' };
  }
}
