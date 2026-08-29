import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { activityService } from '../activity.service';
import { TeamQueryService } from './team-query.service';

const teamQueryService = new TeamQueryService();

export class TeamMemberService {
  async addMember(teamId: string, userId: string, addedBy?: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundError('Team not found');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const existing = await prisma.team.findFirst({
      where: { members: { some: { id: userId } }, id: { not: teamId } },
    });
    if (existing) throw new ConflictError('User is already a member of another team');

    await prisma.team.update({ where: { id: teamId }, data: { members: { connect: { id: userId } } } });
    await prisma.user.update({ where: { id: userId }, data: { teamId } });

    if (addedBy) {
      await activityService.auditLog({
        userId: addedBy, action: 'ASSIGN', entity: 'Team',
        entityId: teamId, newValues: { userId, userName: `${user.firstName} ${user.lastName}` },
      });
    }

    return teamQueryService.findById(teamId);
  }

  async removeMember(teamId: string, userId: string, removedBy?: string) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundError('Team not found');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.team.update({ where: { id: teamId }, data: { members: { disconnect: { id: userId } } } });
    await prisma.user.update({ where: { id: userId }, data: { teamId: null } });

    if (removedBy) {
      await activityService.auditLog({
        userId: removedBy, action: 'REASSIGN', entity: 'Team',
        entityId: teamId, oldValues: { userId, userName: user ? `${user.firstName} ${user.lastName}` : userId },
      });
    }

    return teamQueryService.findById(teamId);
  }
}
