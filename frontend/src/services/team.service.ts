import api from './api';
import type { Team, PaginatedResponse } from '@/types';

export interface TeamFilters {
  search?: string;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateTeamData {
  name: string;
  description?: string;
  departmentId: string;
  leaderId: string;
  isActive?: boolean;
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export const teamService = {
  async getTeams(filters?: TeamFilters): Promise<PaginatedResponse<Team>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const { data } = await api.get(`/teams?${params.toString()}`);
    return data.data ?? data;
  },

  async getTeam(id: string): Promise<Team> {
    const { data } = await api.get(`/teams/${id}`);
    return data.data ?? data;
  },

  async createTeam(teamData: CreateTeamData): Promise<Team> {
    const { data } = await api.post('/teams', teamData);
    return data.data ?? data;
  },

  async updateTeam(id: string, teamData: UpdateTeamData): Promise<Team> {
    const { data } = await api.patch(`/teams/${id}`, teamData);
    return data.data ?? data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async addMember(teamId: string, userId: string): Promise<void> {
    await api.post(`/teams/${teamId}/members`, { userId });
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};
