import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/helpers';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import prisma from '../config/database';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

export async function authorizeTaskAccess(req: AuthRequest, taskId: string): Promise<void> {
  const user = req.user!;

  if (user.role === 'COMMANDER') return;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { select: { userId: true } },
      team: { include: { members: { select: { id: true } } } },
    },
  });

  if (!task) throw new ForbiddenError('Task not found');

  if (task.creatorId === user.id) return;
  if (task.assignees.some((a) => a.userId === user.id)) return;

  const teamMembers = (task as any).team?.members;
  if (Array.isArray(teamMembers) && teamMembers.some((m: any) => m.id === user.id)) return;

  if (user.role === 'TEAM_LEAD' && task.departmentId) {
    const department = await prisma.department.findUnique({
      where: { id: task.departmentId },
      include: { teams: { include: { members: { where: { id: user.id } } } } },
    });
    const deptTeams = (department as any)?.teams;
    if (Array.isArray(deptTeams) && deptTeams.some((t: any) => t.members?.length > 0)) return;
  }

  throw new ForbiddenError('You do not have access to this task');
}
