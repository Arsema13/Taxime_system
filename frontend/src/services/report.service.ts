import api from './api';

export interface ReportFilters {
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
  teamId?: string;
  assigneeId?: string;
  priority?: string;
  status?: string;
  category?: string;
}

export type ReportType =
  | 'task-summary'
  | 'employee-performance'
  | 'team-performance'
  | 'department'
  | 'overdue'
  | 'task-history';

export const reportService = {
  async getReport(type: ReportType, filters: ReportFilters = {}): Promise<unknown> {
    const { data } = await api.get(`/reports/${type}`, { params: filters });
    return data.data ?? data;
  },

  async getTaskReport(filters: ReportFilters = {}): Promise<unknown> {
    const { data } = await api.get('/reports', { 
      params: { 
        type: 'task_summary',
        ...filters 
      } 
    });
    return data.data ?? data;
  },

  async exportReport(filters: ReportFilters = {}, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const { data } = await api.get('/reports', {
      params: {
        type: 'task_summary',
        format,
        ...filters
      },
      responseType: 'blob',
    });
    return data;
  },

  async exportPdf(type: ReportType, filters: ReportFilters = {}): Promise<Blob> {
    const { data } = await api.get(`/reports/${type}/export/pdf`, {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  async exportExcel(type: ReportType, filters: ReportFilters = {}): Promise<Blob> {
    const { data } = await api.get(`/reports/${type}/export/excel`, {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },
};

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
