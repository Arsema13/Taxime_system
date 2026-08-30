import api from './api';
import type { CommanderDashboard, MemberDashboard, TeamLeadDashboard } from '@/types';

export const dashboardService = {
  async getCommanderDashboard(): Promise<CommanderDashboard> {
    const { data } = await api.get('/dashboard');
    return data.data ?? data;
  },

  async getTeamLeadDashboard(): Promise<TeamLeadDashboard> {
    const { data } = await api.get('/dashboard');
    return data.data ?? data;
  },

  async getMemberDashboard(): Promise<MemberDashboard> {
    const { data } = await api.get('/dashboard');
    return data.data ?? data;
  },
};
