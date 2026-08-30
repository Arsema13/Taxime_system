import api from './api';
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  UserSession,
} from '@/types';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    return data.data ?? data;
  },

  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data.data ?? data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get('/auth/me');
    return data.data ?? data;
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const { data } = await api.post('/auth/refresh-token');
    return data.data ?? data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post('/auth/forgot-password', payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.post('/auth/change-password', payload);
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(): Promise<void> {
    await api.post('/auth/resend-verification');
  },

  async getSessions(): Promise<UserSession[]> {
    const { data } = await api.get('/auth/sessions');
    return data.data ?? data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },
};
