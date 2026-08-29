import { PaginatedResponse } from '../../types';
import { UserQueryService } from './user-query.service';
import { UserCrudService } from './user-crud.service';
import { UserStatsService } from './user-stats.service';

export class UserService {
  private query = new UserQueryService();
  private crud = new UserCrudService();
  private stats = new UserStatsService();

  async findAll(query: {
    page?: number; limit?: number; search?: string; role?: string;
    status?: string; departmentId?: string; teamId?: string;
    sortBy?: string; sortOrder?: string;
  }): Promise<PaginatedResponse<any>> {
    return this.query.findAll(query);
  }

  async findById(id: string) {
    return this.query.findById(id);
  }

  async create(data: {
    email: string; password: string; firstName: string; lastName: string;
    phone?: string; position?: string; rank?: string; role?: string;
    departmentId?: string; teamId?: string;
  }) {
    return this.crud.create(data);
  }

  async update(id: string, data: {
    firstName?: string; lastName?: string; phone?: string;
    position?: string; rank?: string; avatar?: string;
    role?: string; status?: string; departmentId?: string | null; teamId?: string | null;
  }) {
    return this.crud.update(id, data);
  }

  async deactivate(id: string) {
    return this.crud.deactivate(id);
  }

  async activate(id: string) {
    return this.crud.activate(id);
  }

  async getStats(userId: string) {
    return this.stats.getStats(userId);
  }

  async updateMe(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string; position?: string; rank?: string }) {
    return this.stats.updateMe(userId, data);
  }
}

export const userService = new UserService();
