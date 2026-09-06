import api from './api';
import type {
  AddTeamMemberPayload,
  CreateDepartmentPayload,
  CreateTeamPayload,
  Department,
  PaginatedResponse,
  Team,
  TeamMember,
} from '@/types';

export const departmentService = {
  // ── Departments ────────────────────────────────────────────────────────────
  async getDepartments(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Department>> {
    const { data } = await api.get('/departments', { params: params?.search ? { search: params.search } : {} });
    const departments: Department[] = data.data ?? data;
    return {
      success: true,
      data: departments,
      pagination: { page: 1, limit: departments.length, total: departments.length, totalPages: 1 }
    };
  },

  async getDepartment(id: string): Promise<Department> {
    const { data } = await api.get(`/departments/${id}`);
    return data.data ?? data;
  },

  async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    const { data } = await api.post('/departments', payload);
    return data.data ?? data;
  },

  async updateDepartment(id: string, payload: Partial<CreateDepartmentPayload>): Promise<Department> {
    const { data } = await api.put(`/departments/${id}`, payload);
    return data.data ?? data;
  },

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/departments/${id}`);
  },

  // ── Teams ──────────────────────────────────────────────────────────────────
  async getTeams(departmentId?: string): Promise<Team[]> {
    const { data } = await api.get('/teams', { params: departmentId ? { departmentId } : {} });
    return data.data ?? data;
  },

  async getTeam(id: string): Promise<Team> {
    const { data } = await api.get(`/teams/${id}`);
    return data.data ?? data;
  },

  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const { data } = await api.post('/teams', payload);
    return data.data ?? data;
  },

  async updateTeam(id: string, payload: Partial<CreateTeamPayload>): Promise<Team> {
    const { data } = await api.put(`/teams/${id}`, payload);
    return data.data ?? data;
  },

  async deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const { data } = await api.get(`/teams/${teamId}/members`);
    return data.data ?? data;
  },

  async addTeamMember(teamId: string, payload: AddTeamMemberPayload): Promise<TeamMember> {
    const { data } = await api.post(`/teams/${teamId}/members`, payload);
    return data.data ?? data;
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },

  async setTeamLead(teamId: string, userId: string): Promise<Team> {
    const { data } = await api.patch(`/teams/${teamId}/lead`, { userId });
    return data.data ?? data;
  },
};
