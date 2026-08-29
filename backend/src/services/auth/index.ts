import { AuthRegisterService } from './auth-register.service';
import { AuthLoginService } from './auth-login.service';
import { AuthPasswordService } from './auth-password.service';
import { AuthSessionService } from './auth-session.service';

const registerService = new AuthRegisterService();
const loginService = new AuthLoginService();
const passwordService = new AuthPasswordService();
const sessionService = new AuthSessionService();

export class AuthService {
  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return registerService.register(data);
  }

  async verifyEmail(token: string) {
    return registerService.verifyEmail(token);
  }

  async resendVerification(email: string) {
    return registerService.resendVerification(email);
  }

  async login(email: string, password: string, ip?: string, userAgent?: string) {
    return loginService.login(email, password, ip, userAgent);
  }

  async refreshToken(token: string) {
    return loginService.refreshToken(token);
  }

  async logout(userId: string, sessionId?: string) {
    return loginService.logout(userId, sessionId);
  }

  async forgotPassword(email: string) {
    return passwordService.forgotPassword(email);
  }

  async resetPassword(token: string, newPassword: string) {
    return passwordService.resetPassword(token, newPassword);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return passwordService.changePassword(userId, currentPassword, newPassword);
  }

  async getSessions(userId: string) {
    return sessionService.getSessions(userId);
  }

  async revokeSession(userId: string, sessionId: string) {
    return sessionService.revokeSession(userId, sessionId);
  }
}

export const authService = new AuthService();
