import prisma from '../../config/database';
import { hashPassword } from '../../utils/helpers';
import { BadRequestError, ConflictError } from '../../utils/errors';
import { config } from '../../config';
import { emailService } from '../email.service';
import { AuthUser } from '../../types';
import { TokenService } from './auth-token.service';

const tokenService = new TokenService();

export class AuthRegisterService {
  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already registered');

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        emailVerified: false,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });

    await emailService.send(
      data.email,
      'Verify Your Email - Taxime Task Management',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0d9488;">Welcome to Taxime</h2>
        <p>Hi ${data.firstName},</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${config.frontendUrl}/verify-email?token=${verificationToken}"
           style="display:inline-block;padding:12px 24px;background:#0d9488;color:white;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p style="margin-top:16px;">Or use this token: <strong>${verificationToken}</strong></p>
        <p>This link expires in 24 hours.</p>
        <hr style="border:1px solid #e5e7eb;"/>
        <p style="color:#6b7280;font-size:12px;">Taxime Operations & Task Management System</p>
      </div>`,
    );

    const tokens = tokenService.generateTokens(user);
    return { user, ...tokens, verificationToken };
  }

  async verifyEmail(token: string) {
    const verification = await prisma.passwordReset.findFirst({
      where: { token, used: false, expiresAt: { gt: new Date() } },
    });
    if (!verification) throw new BadRequestError('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });
    await prisma.passwordReset.update({
      where: { id: verification.id },
      data: { used: true },
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If your email exists, a verification link has been sent' };
    if (user.emailVerified) return { message: 'Email is already verified' };

    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.passwordReset.create({
      data: { token: verificationToken, userId: user.id, expiresAt },
    });

    await emailService.send(
      email,
      'Verify Your Email - Taxime Task Management',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#0d9488;">Email Verification</h2>
        <p>Please verify your email address using this token:</p>
        <div style="background:#f3f4f6;padding:12px;border-radius:6px;font-family:monospace;font-size:14px;">${verificationToken}</div>
        <p>This token expires in 24 hours.</p>
        <hr style="border:1px solid #e5e7eb;"/>
        <p style="color:#6b7280;font-size:12px;">Taxime Operations & Task Management System</p>
      </div>`,
    );

    return { message: 'If your email exists, a verification link has been sent' };
  }
}
