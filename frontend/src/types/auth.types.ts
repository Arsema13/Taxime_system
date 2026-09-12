export type Role = 'ADMIN' | 'TEAM_LEAD' | 'MEMBER' | 'EMPLOYEE' | 'SUPER_ADMIN';
export type UserRole = Role;
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  avatar?: string | null;
  position?: string | null;
  rank?: string | null;
  phone?: string | null;
  bio?: string | null;
  isActive?: boolean;
  emailVerified: boolean;
  departmentId?: string | null;
  teamId?: string | null;
  department?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface UserSession {
  id: string;
  ip?: string;
  userAgent?: string;
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
}
