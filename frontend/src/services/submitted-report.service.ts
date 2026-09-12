import api from './api';
import type {
  Report, ReportStats, CreateReportInput, UpdateReportInput,
  ReviewReportInput, ReportFilters
} from '@/types';

class SubmittedReportService {
  async getReports(filters?: ReportFilters): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get(`/submitted-reports?${params.toString()}`);
    return data.data;
  }

  async getReport(id: string): Promise<Report> {
    const { data } = await api.get(`/submitted-reports/${id}`);
    return data.data;
  }

  async createReport(input: CreateReportInput): Promise<Report> {
    const { data } = await api.post('/submitted-reports', input);
    return data.data;
  }

  async updateReport(id: string, input: UpdateReportInput): Promise<Report> {
    const { data } = await api.put(`/submitted-reports/${id}`, input);
    return data.data;
  }

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/submitted-reports/${id}`);
  }

  async submitReport(id: string): Promise<Report> {
    const { data } = await api.post(`/submitted-reports/${id}/submit`);
    return data.data;
  }

  async reviewReport(id: string, input: ReviewReportInput): Promise<Report> {
    const { data } = await api.post(`/submitted-reports/${id}/review`, input);
    return data.data;
  }

  async getStats(): Promise<ReportStats> {
    const { data } = await api.get('/submitted-reports/stats');
    return data.data;
  }

  async exportPdf(filters?: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get(`/reports?type=task_summary&format=pdf&${params.toString()}`, {
      responseType: 'blob'
    });
    return data;
  }

  async exportExcel(filters?: ReportFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const { data } = await api.get(`/reports?type=task_summary&format=excel&${params.toString()}`, {
      responseType: 'blob'
    });
    return data;
  }

  async exportReportPdf(id: string): Promise<Blob> {
    const { data } = await api.get(`/submitted-reports/${id}/export/pdf`, {
      responseType: 'blob'
    });
    return data;
  }

  async exportReportExcel(id: string): Promise<Blob> {
    const { data } = await api.get(`/submitted-reports/${id}/export/excel`, {
      responseType: 'blob'
    });
    return data;
  }

  async exportReportWord(id: string): Promise<Blob> {
    const { data } = await api.get(`/submitted-reports/${id}/export/word`, {
      responseType: 'blob'
    });
    return data;
  }

  async combineReports(input: any): Promise<Report> {
    const { data } = await api.post('/submitted-reports/combine', input);
    return data.data;
  }

  async exportCombinedWord(payload: { reportIds: string[]; title?: string; summary?: string; notes?: string }): Promise<Blob> {
    const { data } = await api.post('/submitted-reports/combine/export/word', payload, {
      responseType: 'blob'
    });
    return data;
  }

  async exportCombinedPdf(payload: { reportIds: string[]; title?: string; summary?: string; notes?: string }): Promise<Blob> {
    const { data } = await api.post('/submitted-reports/combine/export/pdf', payload, {
      responseType: 'blob'
    });
    return data;
  }

  async exportCombinedExcel(payload: { reportIds: string[]; title?: string; summary?: string; notes?: string }): Promise<Blob> {
    const { data } = await api.post('/submitted-reports/combine/export/excel', payload, {
      responseType: 'blob'
    });
    return data;
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  downloadText(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    this.downloadBlob(blob, filename);
  }
}

export const submittedReportService = new SubmittedReportService();
