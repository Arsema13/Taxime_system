import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { socketService } from './services/socket.service';
import { startJobScheduler } from './jobs';
import prisma from './config/database';
import bcrypt from 'bcryptjs';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import departmentRoutes from './routes/department.routes';
import teamRoutes from './routes/team.routes';
import taskRoutes from './routes/task.routes';
import commentRoutes from './routes/comment.routes';
import attachmentRoutes from './routes/attachment.routes';
import notificationRoutes from './routes/notification.routes';
import activityRoutes from './routes/activity.routes';
import dashboardRoutes from './routes/dashboard.routes';
import reportRoutes from './routes/report.routes';
import submittedReportRoutes from './routes/submitted-report.routes';
import templateRoutes from './routes/template.routes';
import settingsRoutes from './routes/settings.routes';
import savedFilterRoutes from './routes/savedFilter.routes';
import timeTrackingRoutes from './routes/timeTracking.routes';
import searchRoutes from './routes/search.routes';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Seed endpoint (supports ?force=true to reset & reseed)
app.get('/api/seed', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const userCount = await prisma.user.count();
    if (userCount > 0 && !force) {
      return res.json({ message: 'Database already seeded. Pass ?force=true to re-seed.' });
    }

    if (force) {
      // Clean up in reverse dependency order
      await prisma.auditLog.deleteMany().catch(() => {});
      await prisma.activityLog.deleteMany().catch(() => {});
      await prisma.notification.deleteMany().catch(() => {});
      await prisma.commentMention.deleteMany().catch(() => {});
      await prisma.comment.deleteMany().catch(() => {});
      await prisma.taskAssignee.deleteMany().catch(() => {});
      await prisma.subtaskAssignee.deleteMany().catch(() => {});
      await prisma.subtask.deleteMany().catch(() => {});
      await prisma.taskTag.deleteMany().catch(() => {});
      await prisma.taskDependency.deleteMany().catch(() => {});
      await prisma.attachment.deleteMany().catch(() => {});
      await prisma.taskTimeEntry.deleteMany().catch(() => {});
      await prisma.task.deleteMany().catch(() => {});
      await prisma.report.deleteMany().catch(() => {});
      await prisma.savedFilter.deleteMany().catch(() => {});
      await prisma.userFavorite.deleteMany().catch(() => {});
      await prisma.refreshToken.deleteMany().catch(() => {});
      await prisma.userSession.deleteMany().catch(() => {});
      await prisma.passwordReset.deleteMany().catch(() => {});
      await prisma.userSettings.deleteMany().catch(() => {});
      await prisma.user.deleteMany().catch(() => {});
      await prisma.taskTemplate.deleteMany().catch(() => {});
      await prisma.tag.deleteMany().catch(() => {});
      await prisma.team.deleteMany().catch(() => {});
      await prisma.department.deleteMany().catch(() => {});
      await prisma.systemSetting.deleteMany().catch(() => {});
    }

    const hashedPassword = await bcrypt.hash('password123', 12);

    const management = await prisma.department.create({ data: { name: 'Management', description: 'Executive management' } });
    const operations = await prisma.department.create({ data: { name: 'Operations', description: 'Transport operations' } });
    const finance = await prisma.department.create({ data: { name: 'Finance', description: 'Financial operations' } });
    const hr = await prisma.department.create({ data: { name: 'Human Resources', description: 'HR management' } });
    const technology = await prisma.department.create({ data: { name: 'Technology', description: 'IT and software' } });
    const marketing = await prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and outreach' } });

    const dispatch = await prisma.team.create({ data: { name: 'Dispatch', departmentId: operations.id } });
    const fleetOps = await prisma.team.create({ data: { name: 'Fleet Operations', departmentId: operations.id } });
    const customerSupport = await prisma.team.create({ data: { name: 'Customer Support', departmentId: operations.id } });
    const softwareTeam = await prisma.team.create({ data: { name: 'Software', departmentId: technology.id } });

    await prisma.user.create({ data: { email: 'commander@gmail.com', password: hashedPassword, firstName: 'Abebe', lastName: 'Kebede', role: 'ADMIN' as any, position: 'Operations Director', departmentId: management.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'hana@gmail.com', password: hashedPassword, firstName: 'Hana', lastName: 'Tadesse', role: 'TEAM_LEAD' as any, position: 'Team Lead - Operations', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'arsema@gmail.com', password: hashedPassword, firstName: 'Arsema', lastName: 'Mulugeta', role: 'MEMBER' as any, position: 'Operations Specialist', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'sara@gmail.com', password: hashedPassword, firstName: 'Sara', lastName: 'Bekele', role: 'MEMBER' as any, position: 'Fleet Coordinator', departmentId: operations.id, teamId: fleetOps.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'meron@gmail.com', password: hashedPassword, firstName: 'Meron', lastName: 'Abebe', role: 'MEMBER' as any, position: 'Software Developer', departmentId: technology.id, teamId: softwareTeam.id, status: 'ACTIVE' as any, emailVerified: true } });

    res.json({ message: 'Database seeded successfully! You can now login with commander@gmail.com, hana@gmail.com, arsema@gmail.com / password123' });
  } catch (error: any) {
    res.status(500).json({ message: 'Seeding failed', error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/submitted-reports', submittedReportRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/saved-filters', savedFilterRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Initialize Socket.IO
socketService.initialize(httpServer);

// Start background job scheduler
startJobScheduler();

const PORT = config.port;

async function autoSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) return;

    console.log('[Seed] No users found, seeding database...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const management = await prisma.department.create({ data: { name: 'Management', description: 'Executive management' } });
    const operations = await prisma.department.create({ data: { name: 'Operations', description: 'Transport operations' } });
    const finance = await prisma.department.create({ data: { name: 'Finance', description: 'Financial operations' } });
    const hr = await prisma.department.create({ data: { name: 'Human Resources', description: 'HR management' } });
    const technology = await prisma.department.create({ data: { name: 'Technology', description: 'IT and software' } });
    const marketing = await prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and outreach' } });

    const dispatch = await prisma.team.create({ data: { name: 'Dispatch', departmentId: operations.id } });
    const fleetOps = await prisma.team.create({ data: { name: 'Fleet Operations', departmentId: operations.id } });
    const customerSupport = await prisma.team.create({ data: { name: 'Customer Support', departmentId: operations.id } });
    const softwareTeam = await prisma.team.create({ data: { name: 'Software', departmentId: technology.id } });

    await prisma.user.create({ data: { email: 'commander@gmail.com', password: hashedPassword, firstName: 'Abebe', lastName: 'Kebede', role: 'ADMIN', position: 'Operations Director', departmentId: management.id, status: 'ACTIVE', emailVerified: true } });
    await prisma.user.create({ data: { email: 'hana@gmail.com', password: hashedPassword, firstName: 'Hana', lastName: 'Tadesse', role: 'TEAM_LEAD', position: 'Team Lead - Operations', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE', emailVerified: true } });
    await prisma.user.create({ data: { email: 'arsema@gmail.com', password: hashedPassword, firstName: 'Arsema', lastName: 'Mulugeta', role: 'MEMBER', position: 'Operations Specialist', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE', emailVerified: true } });
    await prisma.user.create({ data: { email: 'sara@gmail.com', password: hashedPassword, firstName: 'Sara', lastName: 'Bekele', role: 'MEMBER', position: 'Fleet Coordinator', departmentId: operations.id, teamId: fleetOps.id, status: 'ACTIVE', emailVerified: true } });
    await prisma.user.create({ data: { email: 'meron@gmail.com', password: hashedPassword, firstName: 'Meron', lastName: 'Abebe', role: 'MEMBER', position: 'Software Developer', departmentId: technology.id, teamId: softwareTeam.id, status: 'ACTIVE', emailVerified: true } });

    console.log('[Seed] Database seeded successfully!');
  } catch (error: any) {
    console.error('[Seed] Auto-seed failed:', error.message);
  }
}

httpServer.listen(PORT, async () => {
  console.log(`Taxime API server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Socket.IO initialized`);
  console.log(`Background jobs started`);
  await autoSeed();
});

export default app;
