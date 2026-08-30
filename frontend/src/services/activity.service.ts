import api from './api';
import type { ActivityLog, PaginatedResponse } from '@/types';

export const activityService = {
  async getActivities(params: { 
    page?: number; 
    limit?: number; 
    userId?: string; 
    action?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  } = {}): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await api.get('/activity/recent', { params });
    return data.data ?? data;
  },

  async getGlobalActivity(params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await api.get('/activity/recent', { params });
    return data.data ?? data;
  },

  async getAuditLog(params: { page?: number; limit?: number; userId?: string; action?: string } = {}): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await api.get('/activity/audit', { params });
    return data.data ?? data;
  },

  async exportActivities(params: any = {}): Promise<Blob> {
    const { data } = await api.get('/activity/export', { params, responseType: 'blob' });
    return data;
  },
};
