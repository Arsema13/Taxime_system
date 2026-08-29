import { PaginatedResponse } from '../../types';
import { TeamQueryService } from './team-query.service';
import { TeamCrudService } from './team-crud.service';
import { TeamMemberService } from './team-member.service';

export class TeamService {
  private query = new TeamQueryService();
  private crud = new TeamCrudService();
  private member = new TeamMemberService();

  async findAll(query: { page?: number; limit?: number; departmentId?: string; search?: string }): Promise<PaginatedResponse<any>> {
    return this.query.findAll(query);
  }

  async findById(id: string) {
    return this.query.findById(id);
  }

  async create(data: { name: string; description?: string; departmentId: string }, userId?: string) {
    return this.crud.create(data, userId);
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean; departmentId?: string }, userId?: string) {
    return this.crud.update(id, data, userId);
  }

  async addMember(teamId: string, userId: string, addedBy?: string) {
    return this.member.addMember(teamId, userId, addedBy);
  }

  async removeMember(teamId: string, userId: string, removedBy?: string) {
    return this.member.removeMember(teamId, userId, removedBy);
  }

  async delete(id: string, userId?: string) {
    return this.crud.delete(id, userId);
  }
}

export const teamService = new TeamService();
