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

// One-time seed endpoint (only works if no users exist)
app.get('/api/seed', async (_req, res) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.json({ message: 'Database already seeded. Users exist.' });
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

    await prisma.user.create({ data: { email: 'commander@taxime.com', password: hashedPassword, firstName: 'Abebe', lastName: 'Kebede', role: 'COMMANDER' as any, position: 'Operations Director', departmentId: management.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'hana@taxime.com', password: hashedPassword, firstName: 'Hana', lastName: 'Tadesse', role: 'TEAM_LEAD' as any, position: 'Team Lead - Operations', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'arsema@taxime.com', password: hashedPassword, firstName: 'Arsema', lastName: 'Mulugeta', role: 'MEMBER' as any, position: 'Operations Specialist', departmentId: operations.id, teamId: dispatch.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'sara@taxime.com', password: hashedPassword, firstName: 'Sara', lastName: 'Bekele', role: 'MEMBER' as any, position: 'Fleet Coordinator', departmentId: operations.id, teamId: fleetOps.id, status: 'ACTIVE' as any, emailVerified: true } });
    await prisma.user.create({ data: { email: 'meron@taxime.com', password: hashedPassword, firstName: 'Meron', lastName: 'Abebe', role: 'MEMBER' as any, position: 'Software Developer', departmentId: technology.id, teamId: softwareTeam.id, status: 'ACTIVE' as any, emailVerified: true } });

    res.json({ message: 'Database seeded successfully! You can now login with commander@taxime.com / password123' });
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

httpServer.listen(PORT, () => {
  console.log(`Taxime API server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Socket.IO initialized`);
  console.log(`Background jobs started`);
});

export default app;
