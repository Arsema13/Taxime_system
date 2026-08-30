import api from './api';
import type {
  ActivityLog,
  Attachment,
  Comment,
  CreateTaskPayload,
  PaginatedResponse,
  Subtask,
  Task,
  TaskQueryParams,
  TaskTemplate,
  UpdateTaskPayload,
} from '@/types';

function buildParams(params: Record<string, unknown>) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) v.forEach((item) => p.append(k, String(item)));
    else p.append(k, String(v));
  });
  return p;
}

export const taskService = {
  // ── CRUD ──────────────────────────────────────────────────────────────────
  async getTasks(params: TaskQueryParams = {}): Promise<PaginatedResponse<Task>> {
    const { data } = await api.get('/tasks', { params: buildParams(params as Record<string, unknown>) });
    return data;
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data ?? data;
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post('/tasks', payload);
    return data.data ?? data;
  },

  async updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data.data ?? data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async archiveTask(id: string): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/archive`);
    return data.data ?? data;
  },

  async toggleFavorite(id: string): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/favorite`);
    return data.data ?? data;
  },

  // ── Workflow actions ───────────────────────────────────────────────────────
  async assignTask(id: string, assigneeIds: string[]): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/assign`, { assigneeIds });
    return data.data ?? data;
  },

  async acceptTask(id: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/accept`);
    return data.data ?? data;
  },

  async startTask(id: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/start`);
    return data.data ?? data;
  },

  async submitTask(id: string, notes?: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/submit`, { notes });
    return data.data ?? data;
  },

  async approveTask(id: string, notes?: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/approve`, { notes });
    return data.data ?? data;
  },

  async rejectTask(id: string, reason: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/reject`, { reason });
    return data.data ?? data;
  },

  async holdTask(id: string, reason?: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/hold`, { reason });
    return data.data ?? data;
  },

  async cancelTask(id: string, reason?: string): Promise<Task> {
    const { data } = await api.post(`/tasks/${id}/cancel`, { reason });
    return data.data ?? data;
  },

  async updateProgress(id: string, progress: number): Promise<Task> {
    const { data } = await api.patch(`/tasks/${id}/progress`, { progress });
    return data.data ?? data;
  },

  // ── Comments ───────────────────────────────────────────────────────────────
  async getComments(taskId: string): Promise<Comment[]> {
    const { data } = await api.get(`/tasks/${taskId}/comments`);
    return data.data ?? data;
  },

  async createComment(taskId: string, content: string, parentId?: string): Promise<Comment> {
    const { data } = await api.post(`/tasks/${taskId}/comments`, { content, parentId });
    return data.data ?? data;
  },

  async updateComment(taskId: string, commentId: string, content: string): Promise<Comment> {
    const { data } = await api.put(`/tasks/${taskId}/comments/${commentId}`, { content });
    return data.data ?? data;
  },

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // ── Attachments ────────────────────────────────────────────────────────────
  async getAttachments(taskId: string): Promise<Attachment[]> {
    const { data } = await api.get(`/tasks/${taskId}/attachments`);
    return data.data ?? data;
  },

  async uploadAttachment(taskId: string, file: File): Promise<Attachment> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/tasks/${taskId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data ?? data;
  },

  async deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },

  // ── Subtasks ───────────────────────────────────────────────────────────────
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const { data } = await api.get(`/tasks/${taskId}/subtasks`);
    return data.data ?? data;
  },

  async createSubtask(taskId: string, title: string): Promise<Subtask> {
    const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return data.data ?? data;
  },

  async updateSubtask(taskId: string, subtaskId: string, payload: Partial<Subtask>): Promise<Subtask> {
    const { data } = await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, payload);
    return data.data ?? data;
  },

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  },

  // ── Activity ───────────────────────────────────────────────────────────────
  async getActivity(taskId: string): Promise<ActivityLog[]> {
    const { data } = await api.get(`/tasks/${taskId}/activity`);
    return data.data ?? data;
  },

  // ── Templates ─────────────────────────────────────────────────────────────
  async getTemplates(): Promise<TaskTemplate[]> {
    const { data } = await api.get('/tasks/templates');
    return data.data ?? data;
  },

  async createFromTemplate(templateId: string, overrides: Partial<CreateTaskPayload>): Promise<Task> {
    const { data } = await api.post(`/tasks/templates/${templateId}/create`, overrides);
    return data.data ?? data;
  },

  // ── Bulk ───────────────────────────────────────────────────────────────────
  async bulkUpdate(taskIds: string[], payload: UpdateTaskPayload): Promise<void> {
    await api.patch('/tasks/bulk', { taskIds, ...payload });
  },

  async bulkArchive(taskIds: string[]): Promise<void> {
    await api.patch('/tasks/bulk/archive', { taskIds });
  },

  // ── Search ─────────────────────────────────────────────────────────────────
  async search(query: string): Promise<{ tasks: Task[]; total: number }> {
    const { data } = await api.get('/search', { params: { q: query } });
    return data.data ?? data;
  },
};
