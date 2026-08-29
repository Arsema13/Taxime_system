import { findAllTask, findTaskById } from './task-query.service';
import { createTask, createTaskFromTemplate } from './task-create.service';
import { updateTask, deleteTask } from './task-update.service';
import { assignTask, bulkUpdateTasks } from './task-assign.service';
import { changeTaskStatus } from './task-status.service';
import { addSubtask, toggleSubtask } from './task-subtask.service';
import { addDependency, removeDependency } from './task-dependency.service';
import { toggleFavorite } from './task-favorite.service';
import { getWorkload } from './task-workload.service';
import { searchTasksGlobal } from './task-search.service';

export class TaskService {
  async findAll(query: any) { return findAllTask(query); }
  async findById(id: string) { return findTaskById(id); }
  async create(data: any) { return createTask(data); }
  async update(id: string, userId: string, userRole: string, data: Record<string, any>) { return updateTask(id, userId, userRole, data); }
  async delete(id: string, userId: string) { return deleteTask(id, userId); }
  async assign(taskId: string, assigneeIds: string[], primaryAssigneeId?: string, assignedBy?: string) { return assignTask(taskId, assigneeIds, primaryAssigneeId, assignedBy); }
  async changeStatus(taskId: string, newStatus: string, userId: string) { return changeTaskStatus(taskId, newStatus, userId); }
  async addSubtask(taskId: string, data: { title: string; assigneeIds?: string[] }, creatorId: string) { return addSubtask(taskId, data, creatorId); }
  async toggleSubtask(subtaskId: string, userId: string) { return toggleSubtask(subtaskId, userId); }
  async addDependency(taskId: string, dependsOnId: string, userId: string) { return addDependency(taskId, dependsOnId, userId); }
  async removeDependency(taskId: string, dependsOnId: string) { return removeDependency(taskId, dependsOnId); }
  async toggleFavorite(taskId: string, userId: string) { return toggleFavorite(taskId, userId); }
  async getWorkload(teamId?: string, departmentId?: string) { return getWorkload(teamId, departmentId); }
  async createFromTemplate(templateId: string, creatorId: string, overrides?: any) { return createTaskFromTemplate(templateId, creatorId, overrides); }
  async bulkUpdate(taskIds: string[], action: string, data: Record<string, any>, userId: string) { return bulkUpdateTasks(taskIds, action, data, userId); }
  async searchGlobal(query: string) { return searchTasksGlobal(query); }
}

export const taskService = new TaskService();
