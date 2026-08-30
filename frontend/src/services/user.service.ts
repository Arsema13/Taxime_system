import api from './api';
import type {
  AdminUpdateUserPayload,
  CreateUserPayload,
  PaginatedResponse,
  UpdateUserPayload,
  User,
  UserQueryParams,
  UserStats,
} from '@/types';

export const userService = {
  async getUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    const { data } = await api.get('/users', { params });
    return data;
  },

  async getUser(id: string): Promise<User> {
    const { data } = await api.get(`/users/${id}`);
    return data.data ?? data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post('/users', payload);
    return data.data ?? data;
  },

  async updateUser(id: string, payload: AdminUpdateUserPayload): Promise<User> {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data ?? data;
  },

  async updateProfile(payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put('/users/profile', payload);
    return data.data ?? data;
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post('/users/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data ?? data;
  },

  async deactivateUser(id: string): Promise<User> {
    const { data } = await api.patch(`/users/${id}/deactivate`);
    return data.data ?? data;
  },

  async activateUser(id: string): Promise<User> {
    const { data } = await api.patch(`/users/${id}/activate`);
    return data.data ?? data;
  },

  async getUserStats(id: string): Promise<UserStats> {
    const { data } = await api.get(`/users/${id}/stats`);
    return data.data ?? data;
  },

  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const { data } = await api.get('/users/search', { params: { q: query, limit } });
    return data.data ?? data;
  },
};
