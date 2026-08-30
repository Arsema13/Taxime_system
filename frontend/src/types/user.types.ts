import type { Role, UserStatus } from './auth.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: Role;
  status: UserStatus;
  avatar?: string | null;
  position?: string | null;
  rank?: string | null;
  phone?: string | null;
  emailVerified: boolean;
  departmentId?: string | null;
  teamId?: string | null;
  department?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalAssigned: number;
  totalCompleted: number;
  totalOverdue: number;
  completionRate: number;
  avgCompletionTime?: number;
  tasksThisMonth?: number;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string;
  teamId?: string;
  position?: string;
  rank?: string;
  phone?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
  rank?: string;
  avatar?: string;
}

export interface AdminUpdateUserPayload extends UpdateUserPayload {
  role?: Role;
  status?: UserStatus;
  departmentId?: string | null;
  teamId?: string | null;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  departmentId?: string;
  teamId?: string;
}
