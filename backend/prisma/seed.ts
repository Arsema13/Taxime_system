import { PrismaClient, Role, TaskStatus, TaskPriority, TaskCategory, UserStatus, RecurrenceType, ReportType, ReportPeriod, ReportStatus, AuditAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function hoursAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

async function main() {
  console.log('Seeding database...');

  // ─── Departments ────────────────────────────────────────────────────────────
  const management = await prisma.department.create({ data: { name: 'Management', description: 'Executive management and strategic planning' } });
  const operations = await prisma.department.create({ data: { name: 'Operations', description: 'Transport operations and logistics' } });
  const finance = await prisma.department.create({ data: { name: 'Finance', description: 'Financial operations, accounting, and budgeting' } });
  const hr = await prisma.department.create({ data: { name: 'Human Resources', description: 'HR management, recruitment, and employee relations' } });
  const technology = await prisma.department.create({ data: { name: 'Technology', description: 'IT, software development, and infrastructure' } });
  const marketing = await prisma.department.create({ data: { name: 'Marketing', description: 'Marketing, branding, and outreach' } });
  const safety = await prisma.department.create({ data: { name: 'Safety & Compliance', description: 'Regulatory compliance, safety audits, and inspections' } });

  // ─── Teams ──────────────────────────────────────────────────────────────────
  const dispatch = await prisma.team.create({ data: { name: 'Dispatch', departmentId: operations.id } });
  const fleetOps = await prisma.team.create({ data: { name: 'Fleet Operations', departmentId: operations.id } });
  const customerSupport = await prisma.team.create({ data: { name: 'Customer Support', departmentId: operations.id } });
  const softwareTeam = await prisma.team.create({ data: { name: 'Software', departmentId: technology.id } });
  const itSupport = await prisma.team.create({ data: { name: 'IT Support', departmentId: technology.id } });
  const accounting = await prisma.team.create({ data: { name: 'Accounting', departmentId: finance.id } });
  const talentAcq = await prisma.team.create({ data: { name: 'Talent Acquisition', departmentId: hr.id } });
  const digitalMarketing = await prisma.team.create({ data: { name: 'Digital Marketing', departmentId: marketing.id } });
  const complianceTeam = await prisma.team.create({ data: { name: 'Compliance', departmentId: safety.id } });

  // ─── Users ──────────────────────────────────────────────────────────────────
  const hashedPassword = await hashPassword('password123');

  const commander = await prisma.user.create({
    data: {
      email: 'commander@taxime.com', password: hashedPassword,
      firstName: 'Abebe', lastName: 'Kebede', role: Role.ADMIN,
      position: 'Operations Director', departmentId: management.id,
      status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000001',
    },
  });

  const teamLead1 = await prisma.user.create({
    data: {
      email: 'hana@taxime.com', password: hashedPassword,
      firstName: 'Hana', lastName: 'Tadesse', role: Role.TEAM_LEAD,
      position: 'Team Lead - Operations', departmentId: operations.id,
      teamId: dispatch.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000002',
    },
  });

  const teamLead2 = await prisma.user.create({
    data: {
      email: 'dawit@taxime.com', password: hashedPassword,
      firstName: 'Dawit', lastName: 'Haile', role: Role.TEAM_LEAD,
      position: 'Team Lead - Technology', departmentId: technology.id,
      teamId: softwareTeam.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000003',
    },
  });

  const teamLead3 = await prisma.user.create({
    data: {
      email: 'fatima@taxime.com', password: hashedPassword,
      firstName: 'Fatima', lastName: 'Ahmed', role: Role.TEAM_LEAD,
      position: 'Team Lead - Finance', departmentId: finance.id,
      teamId: accounting.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000004',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'arsema@taxime.com', password: hashedPassword,
      firstName: 'Arsema', lastName: 'Mulugeta', role: Role.MEMBER,
      position: 'Operations Specialist', departmentId: operations.id,
      teamId: dispatch.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000005',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'sara@taxime.com', password: hashedPassword,
      firstName: 'Sara', lastName: 'Bekele', role: Role.MEMBER,
      position: 'Fleet Coordinator', departmentId: operations.id,
      teamId: fleetOps.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000006',
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: 'abel@taxime.com', password: hashedPassword,
      firstName: 'Abel', lastName: 'Dereje', role: Role.MEMBER,
      position: 'Support Agent', departmentId: operations.id,
      teamId: customerSupport.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000007',
    },
  });

  const member4 = await prisma.user.create({
    data: {
      email: 'meron@taxime.com', password: hashedPassword,
      firstName: 'Meron', lastName: 'Abebe', role: Role.MEMBER,
      position: 'Software Developer', departmentId: technology.id,
      teamId: softwareTeam.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000008',
    },
  });

  const member5 = await prisma.user.create({
    data: {
      email: 'yonas@taxime.com', password: hashedPassword,
      firstName: 'Yonas', lastName: 'Girma', role: Role.MEMBER,
      position: 'Accountant', departmentId: finance.id,
      teamId: accounting.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000009',
    },
  });

  const member6 = await prisma.user.create({
    data: {
      email: 'liya@taxime.com', password: hashedPassword,
      firstName: 'Liya', lastName: 'Tesfaye', role: Role.MEMBER,
      position: 'HR Specialist', departmentId: hr.id,
      teamId: talentAcq.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000010',
    },
  });

  const member7 = await prisma.user.create({
    data: {
      email: 'kaleb@taxime.com', password: hashedPassword,
      firstName: 'Kaleb', lastName: 'Mengistu', role: Role.MEMBER,
      position: 'Marketing Specialist', departmentId: marketing.id,
      teamId: digitalMarketing.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000011',
    },
  });

  const member8 = await prisma.user.create({
    data: {
      email: 'nadia@taxime.com', password: hashedPassword,
      firstName: 'Nadia', lastName: 'Ibrahim', role: Role.MEMBER,
      position: 'Safety Officer', departmentId: safety.id,
      teamId: complianceTeam.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000012',
    },
  });

  const member9 = await prisma.user.create({
    data: {
      email: 'samuel@taxime.com', password: hashedPassword,
      firstName: 'Samuel', lastName: 'Tadesse', role: Role.MEMBER,
      position: 'IT Support Engineer', departmentId: technology.id,
      teamId: itSupport.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000013',
    },
  });

  const member10 = await prisma.user.create({
    data: {
      email: 'helen@taxime.com', password: hashedPassword,
      firstName: 'Helen', lastName: 'Alemayehu', role: Role.MEMBER,
      position: 'Customer Service Lead', departmentId: operations.id,
      teamId: customerSupport.id, status: UserStatus.ACTIVE, emailVerified: true, phone: '+251911000014',
    },
  });

  const inactiveUser = await prisma.user.create({
    data: {
      email: 'getachew@taxime.com', password: hashedPassword,
      firstName: 'Getachew', lastName: 'Worku', role: Role.MEMBER,
      position: 'Former Driver', departmentId: operations.id,
      teamId: fleetOps.id, status: UserStatus.INACTIVE, emailVerified: true,
    },
  });

  // ─── Tags ───────────────────────────────────────────────────────────────────
  const urgentTag = await prisma.tag.create({ data: { name: 'urgent', color: '#ef4444' } });
  const monthlyTag = await prisma.tag.create({ data: { name: 'monthly', color: '#3b82f6' } });
  const internalTag = await prisma.tag.create({ data: { name: 'internal', color: '#6b7280' } });
  const safetyTag = await prisma.tag.create({ data: { name: 'safety', color: '#f59e0b' } });
  const complianceTag = await prisma.tag.create({ data: { name: 'compliance', color: '#8b5cf6' } });
  const trainingTag = await prisma.tag.create({ data: { name: 'training', color: '#10b981' } });
  const budgetTag = await prisma.tag.create({ data: { name: 'budget', color: '#ec4899' } });
  const customerTag = await prisma.tag.create({ data: { name: 'customer-facing', color: '#06b6d4' } });
  const infrastructureTag = await prisma.tag.create({ data: { name: 'infrastructure', color: '#78716c' } });
  const quarterlyTag = await prisma.tag.create({ data: { name: 'quarterly', color: '#2563eb' } });

  // ─── Tasks ──────────────────────────────────────────────────────────────────

  // --- Operations Tasks ---
  const task1 = await prisma.task.create({
    data: {
      title: 'Prepare Monthly Fleet Report',
      description: 'Compile and prepare the monthly fleet operations report including vehicle usage, maintenance costs, and performance metrics for August 2026.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH,
      category: TaskCategory.OPERATIONS, progress: 40,
      dueDate: daysFromNow(9), estimatedHours: 16, startDate: daysAgo(5),
      creatorId: commander.id, departmentId: operations.id, teamId: fleetOps.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task1.id, userId: member2.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task1.id, tagId: monthlyTag.id } });

  const task2 = await prisma.task.create({
    data: {
      title: 'Update Dispatch System',
      description: 'Implement new routing algorithm for the dispatch system to optimize vehicle allocation and reduce average response time by 20%.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.CRITICAL,
      category: TaskCategory.IT, progress: 25,
      dueDate: daysFromNow(24), estimatedHours: 80, startDate: daysAgo(3),
      creatorId: commander.id, departmentId: technology.id, teamId: softwareTeam.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task2.id, userId: member4.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task2.id, userId: teamLead2.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task2.id, tagId: urgentTag.id } });
  await prisma.taskTag.create({ data: { taskId: task2.id, tagId: infrastructureTag.id } });

  const task3 = await prisma.task.create({
    data: {
      title: 'Weekly Operations Report',
      description: 'Prepare the weekly operations summary report for management review covering dispatch efficiency and vehicle utilization.',
      status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM,
      category: TaskCategory.OPERATIONS, progress: 100,
      dueDate: daysAgo(12), completedAt: daysAgo(13), estimatedHours: 8, startDate: daysAgo(16),
      creatorId: teamLead1.id, departmentId: operations.id, teamId: dispatch.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task3.id, userId: member1.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task3.id, tagId: monthlyTag.id } });

  const task4 = await prisma.task.create({
    data: {
      title: 'Driver Training Schedule',
      description: 'Create and distribute the quarterly driver training schedule covering defensive driving, safety protocols, and customer service.',
      status: TaskStatus.PENDING, priority: TaskPriority.LOW,
      category: TaskCategory.HR, progress: 0,
      dueDate: daysFromNow(7), estimatedHours: 6,
      creatorId: commander.id, departmentId: hr.id, teamId: talentAcq.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task4.id, userId: member6.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task4.id, tagId: trainingTag.id } });

  const task5 = await prisma.task.create({
    data: {
      title: 'Vehicle Maintenance Audit Q3',
      description: 'Conduct comprehensive maintenance audit of all 45 vehicles in the fleet. Document compliance with safety standards and flag vehicles needing immediate attention.',
      status: TaskStatus.SUBMITTED_FOR_REVIEW, priority: TaskPriority.HIGH,
      category: TaskCategory.MAINTENANCE, progress: 90,
      dueDate: daysAgo(2), estimatedHours: 24, startDate: daysAgo(20),
      creatorId: commander.id, departmentId: safety.id, teamId: complianceTeam.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task5.id, userId: member8.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task5.id, userId: member2.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task5.id, tagId: safetyTag.id } });
  await prisma.taskTag.create({ data: { taskId: task5.id, tagId: quarterlyTag.id } });

  const task6 = await prisma.task.create({
    data: {
      title: 'Customer Complaint Resolution Process',
      description: 'Redesign the customer complaint resolution workflow to reduce average resolution time from 48 hours to 24 hours.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM,
      category: TaskCategory.CUSTOMER_SUPPORT, progress: 60,
      dueDate: daysFromNow(12), estimatedHours: 20, startDate: daysAgo(10),
      creatorId: teamLead1.id, departmentId: operations.id, teamId: customerSupport.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task6.id, userId: member3.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task6.id, userId: member10.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task6.id, tagId: customerTag.id } });

  const task7 = await prisma.task.create({
    data: {
      title: 'Fuel Cost Analysis Report',
      description: 'Analyze fuel consumption patterns across all routes and identify cost-saving opportunities. Compare with previous quarter data.',
      status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH,
      category: TaskCategory.FINANCE, progress: 100,
      dueDate: daysAgo(5), completedAt: daysAgo(6), estimatedHours: 12, startDate: daysAgo(15),
      creatorId: teamLead3.id, departmentId: finance.id, teamId: accounting.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task7.id, userId: member5.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task7.id, tagId: budgetTag.id } });

  const task8 = await prisma.task.create({
    data: {
      title: 'Social Media Campaign - Back to School',
      description: 'Launch back-to-school promotional campaign targeting parents for school transport services. Create content for Facebook, Instagram, and TikTok.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM,
      category: TaskCategory.MARKETING, progress: 35,
      dueDate: daysFromNow(18), estimatedHours: 30, startDate: daysAgo(7),
      creatorId: commander.id, departmentId: marketing.id, teamId: digitalMarketing.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task8.id, userId: member7.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task8.id, tagId: customerTag.id } });

  const task9 = await prisma.task.create({
    data: {
      title: 'Server Infrastructure Upgrade',
      description: 'Upgrade backend servers to handle increased load. Migrate database to new cluster and implement auto-scaling.',
      status: TaskStatus.PENDING, priority: TaskPriority.CRITICAL,
      category: TaskCategory.IT, progress: 0,
      dueDate: daysFromNow(30), estimatedHours: 60,
      creatorId: teamLead2.id, departmentId: technology.id, teamId: itSupport.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task9.id, userId: member9.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task9.id, tagId: infrastructureTag.id } });
  await prisma.taskTag.create({ data: { taskId: task9.id, tagId: urgentTag.id } });

  const task10 = await prisma.task.create({
    data: {
      title: 'Monthly Payroll Processing',
      description: 'Process payroll for all 120 employees. Verify attendance records, overtime, deductions, and generate payslips.',
      status: TaskStatus.COMPLETED, priority: TaskPriority.CRITICAL,
      category: TaskCategory.FINANCE, progress: 100,
      dueDate: daysAgo(8), completedAt: daysAgo(9), estimatedHours: 16, startDate: daysAgo(12),
      creatorId: teamLead3.id, departmentId: finance.id, teamId: accounting.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task10.id, userId: member5.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task10.id, tagId: monthlyTag.id } });
  await prisma.taskTag.create({ data: { taskId: task10.id, tagId: internalTag.id } });

  const task11 = await prisma.task.create({
    data: {
      title: 'Route Optimization for Addis Ababa West',
      description: 'Optimize dispatch routes for the West Addis Ababa zone to reduce average trip time and fuel consumption.',
      status: TaskStatus.ACCEPTED, priority: TaskPriority.HIGH,
      category: TaskCategory.OPERATIONS, progress: 10,
      dueDate: daysFromNow(15), estimatedHours: 24, startDate: daysAgo(1),
      creatorId: teamLead1.id, departmentId: operations.id, teamId: dispatch.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task11.id, userId: member1.id, isPrimary: true } });

  const task12 = await prisma.task.create({
    data: {
      title: 'Employee Onboarding Program Revamp',
      description: 'Redesign the employee onboarding program to include digital orientation, mentorship pairing, and 30-60-90 day check-ins.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM,
      category: TaskCategory.HR, progress: 50,
      dueDate: daysFromNow(20), estimatedHours: 32, startDate: daysAgo(14),
      creatorId: commander.id, departmentId: hr.id, teamId: talentAcq.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task12.id, userId: member6.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task12.id, tagId: trainingTag.id } });

  const task13 = await prisma.task.create({
    data: {
      title: 'Regulatory Compliance Audit Preparation',
      description: 'Prepare all documentation and evidence for the upcoming transport authority compliance audit. Ensure all vehicles have valid permits.',
      status: TaskStatus.OVERDUE, priority: TaskPriority.CRITICAL,
      category: TaskCategory.ADMINISTRATION, progress: 30,
      dueDate: daysAgo(3), estimatedHours: 40, startDate: daysAgo(30),
      creatorId: commander.id, departmentId: safety.id, teamId: complianceTeam.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task13.id, userId: member8.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task13.id, userId: member2.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task13.id, tagId: complianceTag.id } });
  await prisma.taskTag.create({ data: { taskId: task13.id, tagId: urgentTag.id } });

  const task14 = await prisma.task.create({
    data: {
      title: 'Mobile App Bug Fixes',
      description: 'Fix critical bugs in the driver mobile app: GPS tracking drift, notification delivery failures, and offline mode sync issues.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH,
      category: TaskCategory.IT, progress: 70,
      dueDate: daysFromNow(4), estimatedHours: 20, startDate: daysAgo(8),
      creatorId: teamLead2.id, departmentId: technology.id, teamId: softwareTeam.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task14.id, userId: member4.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task14.id, tagId: customerTag.id } });

  const task15 = await prisma.task.create({
    data: {
      title: 'Annual Budget Proposal 2027',
      description: 'Prepare the annual budget proposal for fiscal year 2027 including departmental budgets, capital expenditure forecasts, and ROI projections.',
      status: TaskStatus.DRAFT, priority: TaskPriority.HIGH,
      category: TaskCategory.FINANCE, progress: 15,
      dueDate: daysFromNow(45), estimatedHours: 48,
      creatorId: commander.id, departmentId: finance.id, teamId: accounting.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task15.id, userId: member5.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task15.id, userId: teamLead3.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task15.id, tagId: budgetTag.id } });
  await prisma.taskTag.create({ data: { taskId: task15.id, tagId: quarterlyTag.id } });

  const task16 = await prisma.task.create({
    data: {
      title: 'Customer Satisfaction Survey Analysis',
      description: 'Analyze results from Q2 customer satisfaction survey. Identify trends, pain points, and actionable improvements.',
      status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM,
      category: TaskCategory.CUSTOMER_SUPPORT, progress: 100,
      dueDate: daysAgo(10), completedAt: daysAgo(11), estimatedHours: 10, startDate: daysAgo(18),
      creatorId: teamLead1.id, departmentId: operations.id, teamId: customerSupport.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task16.id, userId: member10.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task16.id, tagId: customerTag.id } });

  const task17 = await prisma.task.create({
    data: {
      title: 'Workplace Safety Inspection',
      description: 'Conduct quarterly workplace safety inspection across all office locations and the vehicle depot. Document findings and corrective actions.',
      status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM,
      category: TaskCategory.MAINTENANCE, progress: 0,
      dueDate: daysFromNow(10), estimatedHours: 12,
      creatorId: commander.id, departmentId: safety.id, teamId: complianceTeam.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task17.id, userId: member8.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task17.id, tagId: safetyTag.id } });

  const task18 = await prisma.task.create({
    data: {
      title: 'Website Redesign Project',
      description: 'Complete redesign of the company website with modern UI/UX, improved SEO, mobile-first approach, and integrated booking system.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM,
      category: TaskCategory.MARKETING, progress: 45,
      dueDate: daysFromNow(40), estimatedHours: 100, startDate: daysAgo(30),
      creatorId: commander.id, departmentId: marketing.id, teamId: digitalMarketing.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task18.id, userId: member7.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task18.id, userId: member4.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task18.id, tagId: customerTag.id } });
  await prisma.taskTag.create({ data: { taskId: task18.id, tagId: infrastructureTag.id } });

  const task19 = await prisma.task.create({
    data: {
      title: 'Holiday Schedule Coordination',
      description: 'Coordinate driver and vehicle schedules for the upcoming Ethiopian holiday season. Ensure adequate coverage for all active routes.',
      status: TaskStatus.CANCELLED, priority: TaskPriority.LOW,
      category: TaskCategory.OPERATIONS, progress: 0,
      dueDate: daysAgo(20),
      creatorId: teamLead1.id, departmentId: operations.id, teamId: dispatch.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task19.id, userId: member1.id, isPrimary: true } });

  const task20 = await prisma.task.create({
    data: {
      title: 'GPS Fleet Tracking System Upgrade',
      description: 'Upgrade GPS tracking hardware in 30 vehicles to the latest generation. Includes installation, calibration, and driver training.',
      status: TaskStatus.ON_HOLD, priority: TaskPriority.HIGH,
      category: TaskCategory.IT, progress: 20,
      dueDate: daysFromNow(35), estimatedHours: 40, startDate: daysAgo(10),
      creatorId: teamLead2.id, departmentId: technology.id, teamId: itSupport.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task20.id, userId: member9.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task20.id, tagId: infrastructureTag.id } });

  const task21 = await prisma.task.create({
    data: {
      title: 'Reconcile Vendor Payments',
      description: 'Reconcile outstanding vendor payments for fuel, maintenance, and insurance providers. Resolve discrepancies and schedule payments.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH,
      category: TaskCategory.FINANCE, progress: 55,
      dueDate: daysFromNow(5), estimatedHours: 14, startDate: daysAgo(4),
      creatorId: teamLead3.id, departmentId: finance.id, teamId: accounting.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task21.id, userId: member5.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task21.id, tagId: budgetTag.id } });

  const task22 = await prisma.task.create({
    data: {
      title: 'New Employee Recruitment - Drivers',
      description: 'Recruit 10 new drivers for the expanded East Addis Ababa route. Include job posting, screening, interviews, and background checks.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM,
      category: TaskCategory.HR, progress: 40,
      dueDate: daysFromNow(25), estimatedHours: 36, startDate: daysAgo(10),
      creatorId: commander.id, departmentId: hr.id, teamId: talentAcq.id,
    },
  });
  await prisma.taskAssignee.create({ data: { taskId: task22.id, userId: member6.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task22.id, tagId: trainingTag.id } });

  // Create dependency: task2 depends on task3
  await prisma.taskDependency.create({ data: { taskId: task2.id, dependsOnId: task3.id } });
  // task21 blocked by task7
  await prisma.taskDependency.create({ data: { taskId: task21.id, dependsOnId: task7.id } });

  // ─── Subtasks ───────────────────────────────────────────────────────────────
  // Task 1 subtasks
  const subtasks1 = [
    { title: 'Collect vehicle data from fleet management system', isCompleted: true },
    { title: 'Review maintenance records', isCompleted: true },
    { title: 'Analyze fuel consumption per route', isCompleted: false },
    { title: 'Calculate performance metrics and KPIs', isCompleted: false },
    { title: 'Prepare report document with charts', isCompleted: false },
    { title: 'Submit to management for review', isCompleted: false },
  ];
  for (let i = 0; i < subtasks1.length; i++) {
    await prisma.subtask.create({
      data: { ...subtasks1[i], order: i, taskId: task1.id, creatorId: commander.id },
    });
  }

  // Task 5 subtasks
  const subtasks5 = [
    { title: 'Inspect engine and transmission', isCompleted: true },
    { title: 'Check brake systems', isCompleted: true },
    { title: 'Verify tire conditions', isCompleted: true },
    { title: 'Test electrical systems', isCompleted: true },
    { title: 'Document compliance gaps', isCompleted: false },
    { title: 'Write final audit report', isCompleted: false },
  ];
  for (let i = 0; i < subtasks5.length; i++) {
    await prisma.subtask.create({
      data: { ...subtasks5[i], order: i, taskId: task5.id, creatorId: commander.id },
    });
  }

  // Task 14 subtasks
  const subtasks14 = [
    { title: 'Fix GPS tracking drift issue', isCompleted: true },
    { title: 'Resolve notification delivery failures', isCompleted: true },
    { title: 'Implement offline mode data sync', isCompleted: false },
    { title: 'QA testing on 5 device types', isCompleted: false },
  ];
  for (let i = 0; i < subtasks14.length; i++) {
    await prisma.subtask.create({
      data: { ...subtasks14[i], order: i, taskId: task14.id, creatorId: teamLead2.id },
    });
  }

  // Task 8 subtasks
  const subtasks8 = [
    { title: 'Design campaign creatives', isCompleted: true },
    { title: 'Write social media copy', isCompleted: true },
    { title: 'Set up ad campaigns', isCompleted: false },
    { title: 'Schedule content calendar', isCompleted: false },
    { title: 'Monitor engagement metrics', isCompleted: false },
  ];
  for (let i = 0; i < subtasks8.length; i++) {
    await prisma.subtask.create({
      data: { ...subtasks8[i], order: i, taskId: task8.id, creatorId: commander.id },
    });
  }

  // Task 12 subtasks
  const subtasks12 = [
    { title: 'Redesign onboarding checklist', isCompleted: true },
    { title: 'Create digital orientation materials', isCompleted: true },
    { title: 'Build mentorship pairing system', isCompleted: false },
    { title: 'Draft 30-60-90 day review templates', isCompleted: false },
    { title: 'Pilot with next 5 new hires', isCompleted: false },
  ];
  for (let i = 0; i < subtasks12.length; i++) {
    await prisma.subtask.create({
      data: { ...subtasks12[i], order: i, taskId: task12.id, creatorId: commander.id },
    });
  }

  // ─── Comments ───────────────────────────────────────────────────────────────
  await prisma.comment.create({
    data: { content: "I've started collecting the vehicle data from the fleet management system. Should have it ready by end of day.", taskId: task1.id, authorId: member2.id },
  });
  await prisma.comment.create({
    data: { content: 'Please make sure to include the maintenance costs broken down by vehicle type this time.', taskId: task1.id, authorId: teamLead1.id },
  });
  const c3 = await prisma.comment.create({
    data: { content: '@Arsema Can you verify the vehicle records from last month before we submit?', taskId: task1.id, authorId: teamLead1.id },
  });
  await prisma.comment.create({
    data: { content: "The routing algorithm is taking longer than expected. I'll need an extra week to optimize the pathfinding logic.", taskId: task2.id, authorId: member4.id },
  });
  await prisma.comment.create({
    data: { content: "Understood. Let's set up a code review session on Thursday to go over the architecture decisions.", taskId: task2.id, authorId: teamLead2.id },
  });
  await prisma.comment.create({
    data: { content: 'Great work on the fuel analysis! The findings about route D7 inefficiency are very actionable.', taskId: task7.id, authorId: teamLead3.id },
  });
  await prisma.comment.create({
    data: { content: 'Thanks! I also noticed that the Bole-Shifta route has 15% higher fuel consumption than average. Might need vehicle inspection.', taskId: task7.id, authorId: member5.id },
  });
  await prisma.comment.create({
    data: { content: 'The audit is overdue and the transport authority is following up. We need to prioritize this immediately.', taskId: task13.id, authorId: commander.id },
  });
  await prisma.comment.create({
    data: { content: "I'm working on it now. Found 8 vehicles with expired permits. Coordinating with the renewal team.", taskId: task13.id, authorId: member8.id },
  });
  await prisma.comment.create({
    data: { content: 'The GPS drift fix is deployed to staging. Can someone test on an Android device?', taskId: task14.id, authorId: member4.id },
  });
  await prisma.comment.create({
    data: { content: 'Tested on Samsung Galaxy A54 - GPS accuracy improved from ±50m to ±5m. Looks great!', taskId: task14.id, authorId: member9.id },
  });
  await prisma.comment.create({
    data: { content: 'Campaign engagement is looking strong. 2,400 clicks in the first 3 days, way above our target.', taskId: task8.id, authorId: member7.id },
  });
  await prisma.comment.create({
    data: { content: 'Excellent! Let\'s increase the budget for the Instagram ads since that\'s where most conversions are coming from.', taskId: task8.id, authorId: commander.id },
  });
  await prisma.comment.create({
    data: { content: 'The vendor reconciliation has a discrepancy of 45,000 ETB in the fuel invoices from July. Investigating.', taskId: task21.id, authorId: member5.id },
  });
  await prisma.comment.create({
    data: { content: 'I reviewed 12 candidates so far. 5 are qualified for interviews. Scheduling for next week.', taskId: task22.id, authorId: member6.id },
  });
  // Reply to a comment
  await prisma.comment.create({
    data: { content: 'Confirmed, I\'ll send the verified records by 3 PM today.', taskId: task1.id, authorId: member1.id, parentId: c3.id },
  });

  // ─── Notifications ──────────────────────────────────────────────────────────
  const notifs = [
    { type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Prepare Monthly Fleet Report"', userId: member2.id, taskId: task1.id, actorId: commander.id },
    { type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Update Dispatch System"', userId: member4.id, taskId: task2.id, actorId: commander.id },
    { type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Vehicle Maintenance Audit Q3"', userId: member8.id, taskId: task5.id, actorId: commander.id },
    { type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Route Optimization for Addis Ababa West"', userId: member1.id, taskId: task11.id, actorId: teamLead1.id },
    { type: NotificationType.TASK_ASSIGNED, title: 'New Task Assigned', message: 'You have been assigned to "Annual Budget Proposal 2027"', userId: member5.id, taskId: task15.id, actorId: commander.id },
    { type: NotificationType.COMMENT_ADDED, title: 'New Comment', message: 'Hana Tadesse commented on "Prepare Monthly Fleet Report"', userId: member2.id, taskId: task1.id, actorId: teamLead1.id },
    { type: NotificationType.COMMENT_ADDED, title: 'New Comment', message: 'Dawit Haile commented on "Update Dispatch System"', userId: member4.id, taskId: task2.id, actorId: teamLead2.id },
    { type: NotificationType.TASK_SUBMITTED, title: 'Task Submitted for Review', message: '"Vehicle Maintenance Audit Q3" has been submitted for review', userId: commander.id, taskId: task5.id, actorId: member8.id },
    { type: NotificationType.TASK_OVERDUE, title: 'Task Overdue', message: '"Regulatory Compliance Audit Preparation" is overdue', userId: member8.id, taskId: task13.id, actorId: commander.id },
    { type: NotificationType.TASK_OVERDUE, title: 'Task Overdue', message: '"Regulatory Compliance Audit Preparation" is overdue', userId: commander.id, taskId: task13.id },
    { type: NotificationType.TASK_COMPLETED, title: 'Task Completed', message: '"Fuel Cost Analysis Report" has been completed', userId: teamLead3.id, taskId: task7.id, actorId: member5.id },
    { type: NotificationType.TASK_COMPLETED, title: 'Task Completed', message: '"Monthly Payroll Processing" has been completed', userId: commander.id, taskId: task10.id, actorId: member5.id },
    { type: NotificationType.DEADLINE_REMINDER, title: 'Deadline Approaching', message: '"Customer Complaint Resolution Process" is due in 12 days', userId: member3.id, taskId: task6.id },
    { type: NotificationType.DEADLINE_REMINDER, title: 'Deadline Approaching', message: '"Mobile App Bug Fixes" is due in 4 days', userId: member4.id, taskId: task14.id },
    { type: NotificationType.STATUS_CHANGE, title: 'Status Updated', message: '"Route Optimization for Addis Ababa West" status changed to ACCEPTED', userId: member1.id, taskId: task11.id, actorId: teamLead1.id },
    { type: NotificationType.NEW_USER_REGISTERED, title: 'New User Registered', message: 'Helen Alemayehu has created an account and is waiting to be assigned a role and team.', userId: commander.id, actorId: member10.id, link: '/employees' },
    { type: NotificationType.PROGRESS_UPDATE, title: 'Progress Updated', message: '"Social Media Campaign - Back to School" progress updated to 35%', userId: commander.id, taskId: task8.id, actorId: member7.id },
    { type: NotificationType.ATTACHMENT_ADDED, title: 'Attachment Added', message: 'A file was uploaded to "Vehicle Maintenance Audit Q3"', userId: commander.id, taskId: task5.id, actorId: member8.id },
  ];
  for (const n of notifs) {
    await prisma.notification.create({ data: n });
  }

  // ─── Activity Logs ──────────────────────────────────────────────────────────
  const activities = [
    { taskId: task1.id, userId: commander.id, action: 'Task created', details: { title: task1.title } },
    { taskId: task1.id, userId: commander.id, action: 'Task assigned to Sara Bekele', details: { assigneeId: member2.id } },
    { taskId: task1.id, userId: member2.id, action: 'Status changed to IN_PROGRESS', details: { from: 'PENDING', to: 'IN_PROGRESS' } },
    { taskId: task1.id, userId: member2.id, action: 'Progress updated to 40%', details: { progress: 40 } },
    { taskId: task2.id, userId: commander.id, action: 'Task created', details: { title: task2.title } },
    { taskId: task2.id, userId: commander.id, action: 'Task assigned to Meron Abebe', details: { assigneeId: member4.id } },
    { taskId: task2.id, userId: member4.id, action: 'Status changed to IN_PROGRESS', details: { from: 'PENDING', to: 'IN_PROGRESS' } },
    { taskId: task5.id, userId: member8.id, action: 'Status changed to SUBMITTED_FOR_REVIEW', details: { from: 'IN_PROGRESS', to: 'SUBMITTED_FOR_REVIEW' } },
    { taskId: task5.id, userId: member8.id, action: 'Progress updated to 90%', details: { progress: 90 } },
    { taskId: task6.id, userId: member3.id, action: 'Progress updated to 60%', details: { progress: 60 } },
    { taskId: task7.id, userId: member5.id, action: 'Status changed to COMPLETED', details: { from: 'IN_PROGRESS', to: 'COMPLETED' } },
    { taskId: task10.id, userId: member5.id, action: 'Status changed to COMPLETED', details: { from: 'IN_PROGRESS', to: 'COMPLETED' } },
    { taskId: task13.id, userId: commander.id, action: 'Status changed to OVERDUE', details: { from: 'IN_PROGRESS', to: 'OVERDUE' } },
    { taskId: task14.id, userId: member4.id, action: 'Progress updated to 70%', details: { progress: 70 } },
    { taskId: task18.id, userId: member7.id, action: 'Progress updated to 45%', details: { progress: 45 } },
    { taskId: task19.id, userId: teamLead1.id, action: 'Status changed to CANCELLED', details: { from: 'PENDING', to: 'CANCELLED' } },
    { taskId: task20.id, userId: member9.id, action: 'Status changed to ON_HOLD', details: { from: 'IN_PROGRESS', to: 'ON_HOLD' } },
    { taskId: task21.id, userId: member5.id, action: 'Progress updated to 55%', details: { progress: 55 } },
  ];
  for (const a of activities) {
    await prisma.activityLog.create({ data: a });
  }

  // ─── Time Entries ───────────────────────────────────────────────────────────
  const timeEntries = [
    { taskId: task1.id, userId: member2.id, description: 'Collecting vehicle data from fleet management system', startTime: daysAgo(4), endTime: daysAgo(4), duration: 9000 },
    { taskId: task1.id, userId: member2.id, description: 'Reviewing maintenance records', startTime: daysAgo(3), endTime: daysAgo(3), duration: 7200 },
    { taskId: task1.id, userId: member2.id, description: 'Analyzing fuel consumption data', startTime: daysAgo(2), endTime: daysAgo(2), duration: 5400 },
    { taskId: task2.id, userId: member4.id, description: 'Designing routing algorithm architecture', startTime: daysAgo(2), endTime: daysAgo(2), duration: 14400 },
    { taskId: task2.id, userId: member4.id, description: 'Implementing pathfinding logic', startTime: daysAgo(1), endTime: daysAgo(1), duration: 10800 },
    { taskId: task5.id, userId: member8.id, description: 'Engine and transmission inspection - 15 vehicles', startTime: daysAgo(18), endTime: daysAgo(18), duration: 21600 },
    { taskId: task5.id, userId: member8.id, description: 'Brake system inspection', startTime: daysAgo(15), endTime: daysAgo(15), duration: 14400 },
    { taskId: task5.id, userId: member8.id, description: 'Tire condition checks and documentation', startTime: daysAgo(12), endTime: daysAgo(12), duration: 10800 },
    { taskId: task6.id, userId: member3.id, description: 'Current workflow analysis and mapping', startTime: daysAgo(8), endTime: daysAgo(8), duration: 7200 },
    { taskId: task6.id, userId: member10.id, description: 'Customer feedback categorization', startTime: daysAgo(6), endTime: daysAgo(6), duration: 5400 },
    { taskId: task7.id, userId: member5.id, description: 'Fuel consumption data extraction', startTime: daysAgo(14), endTime: daysAgo(14), duration: 10800 },
    { taskId: task7.id, userId: member5.id, description: 'Cost analysis and report writing', startTime: daysAgo(10), endTime: daysAgo(10), duration: 14400 },
    { taskId: task8.id, userId: member7.id, description: 'Campaign creative design', startTime: daysAgo(5), endTime: daysAgo(5), duration: 10800 },
    { taskId: task8.id, userId: member7.id, description: 'Social media copywriting', startTime: daysAgo(3), endTime: daysAgo(3), duration: 7200 },
    { taskId: task10.id, userId: member5.id, description: 'Payroll data verification', startTime: daysAgo(11), endTime: daysAgo(11), duration: 18000 },
    { taskId: task10.id, userId: member5.id, description: 'Payslip generation', startTime: daysAgo(9), endTime: daysAgo(9), duration: 14400 },
    { taskId: task12.id, userId: member6.id, description: 'Onboarding checklist redesign', startTime: daysAgo(12), endTime: daysAgo(12), duration: 10800 },
    { taskId: task12.id, userId: member6.id, description: 'Digital orientation material creation', startTime: daysAgo(8), endTime: daysAgo(8), duration: 14400 },
    { taskId: task14.id, userId: member4.id, description: 'GPS drift fix implementation', startTime: daysAgo(6), endTime: daysAgo(6), duration: 14400 },
    { taskId: task14.id, userId: member4.id, description: 'Notification system debugging', startTime: daysAgo(4), endTime: daysAgo(4), duration: 10800 },
    { taskId: task21.id, userId: member5.id, description: 'Vendor invoice reconciliation', startTime: daysAgo(3), endTime: daysAgo(3), duration: 10800 },
    { taskId: task22.id, userId: member6.id, description: 'Candidate screening and review', startTime: daysAgo(7), endTime: daysAgo(7), duration: 7200 },
  ];
  for (const te of timeEntries) {
    await prisma.taskTimeEntry.create({ data: te });
  }

  // ─── Reports (Submitted Reports) ────────────────────────────────────────────
  const report1 = await prisma.report.create({
    data: {
      title: 'Fleet Performance Report - August 2026',
      reportType: ReportType.MONTHLY_REPORT, period: ReportPeriod.MONTHLY,
      fromDate: new Date('2026-08-01'), toDate: new Date('2026-08-31'),
      summary: 'Fleet performance in August showed a 12% increase in on-time deliveries compared to July. Total distance covered: 45,000 km across 32 active vehicles. Average fuel efficiency improved by 3%.',
      progress: 100, timeSpent: 14,
      achievements: 'Reduced average delivery time by 8 minutes. Zero major safety incidents. Successfully onboarded 3 new vehicles.',
      blockers: 'Spare parts shortage for 2 older vehicles delayed maintenance by 1 week.',
      nextSteps: 'Focus on reducing idle time for vehicles in Zone 3. Begin driver performance reviews.',
      status: ReportStatus.APPROVED,
      submittedAt: daysAgo(3), reviewedAt: daysAgo(1),
      reviewerComment: 'Excellent report with actionable insights. Please add fuel cost breakdown by vehicle type in next month.',
      authorId: member2.id, assignerId: teamLead1.id, taskId: task1.id,
    },
  });

  const report2 = await prisma.report.create({
    data: {
      title: 'Weekly Operations Summary - Week 35',
      reportType: ReportType.WEEKLY_REPORT, period: ReportPeriod.WEEKLY,
      fromDate: daysAgo(14), toDate: daysAgo(7),
      summary: 'Week 35 operations: 94% dispatch success rate, 238 completed trips, 12 customer complaints (down from 18 last week). Vehicle utilization at 78%.',
      progress: 100, timeSpent: 6,
      achievements: 'Dispatch response time improved to under 4 minutes. Resolved 10 of 12 customer complaints within 24 hours.',
      blockers: 'GPS connectivity issues in Akaki area causing intermittent tracking gaps.',
      nextSteps: 'Address GPS coverage gap with network provider. Start driver incentive program pilot.',
      status: ReportStatus.APPROVED,
      submittedAt: daysAgo(6), reviewedAt: daysAgo(5),
      reviewerComment: 'Good summary. Let\'s discuss the GPS issue in the Monday standup.',
      authorId: member1.id, assignerId: teamLead1.id, taskId: task3.id,
    },
  });

  const report3 = await prisma.report.create({
    data: {
      title: 'Vehicle Maintenance Audit - Q3 2026',
      reportType: ReportType.MONTHLY_REPORT, period: ReportPeriod.MONTHLY,
      fromDate: new Date('2026-07-01'), toDate: new Date('2026-09-01'),
      summary: 'Comprehensive audit of 45 vehicles completed. 37 vehicles fully compliant, 6 need minor repairs, 2 require major service. Overall fleet health score: 82/100.',
      progress: 90, timeSpent: 22,
      achievements: 'Completed full audit ahead of regulatory deadline. Identified 8 vehicles with expired permits.',
      blockers: 'Waiting on vendor quotation for 2 major service jobs. Permit renewal paperwork delayed by 3 days.',
      nextSteps: 'Follow up on permit renewals. Schedule major service for the 2 flagged vehicles.',
      status: ReportStatus.SUBMITTED,
      submittedAt: daysAgo(1),
      authorId: member8.id, assignerId: commander.id, taskId: task5.id,
    },
  });

  const report4 = await prisma.report.create({
    data: {
      title: 'Fuel Cost Analysis - Q2 2026',
      reportType: ReportType.MONTHLY_REPORT, period: ReportPeriod.MONTHLY,
      fromDate: new Date('2026-04-01'), toDate: new Date('2026-06-30'),
      summary: 'Total fuel expenditure for Q2: 2.4M ETB. Route D7 (Bole-Shifta) shows 15% above-average consumption. Recommend vehicle inspection for 5 vehicles on this route.',
      progress: 100, timeSpent: 10,
      achievements: 'Identified potential annual savings of 180,000 ETB through route optimization. Created fuel efficiency benchmarking dashboard.',
      blockers: 'None.',
      nextSteps: 'Implement route optimization recommendations. Begin monthly fuel tracking reports.',
      status: ReportStatus.APPROVED,
      submittedAt: daysAgo(5), reviewedAt: daysAgo(4),
      reviewerComment: 'Outstanding analysis. The savings projection is very promising. Let\'s prioritize the D7 route fix.',
      authorId: member5.id, assignerId: teamLead3.id, taskId: task7.id,
    },
  });

  const report5 = await prisma.report.create({
    data: {
      title: 'Monthly Payroll Report - August 2026',
      reportType: ReportType.MONTHLY_REPORT, period: ReportPeriod.MONTHLY,
      fromDate: new Date('2026-08-01'), toDate: new Date('2026-08-31'),
      summary: 'Processed payroll for 120 employees. Total disbursement: 3.6M ETB. 5 overtime claims processed. 2 new hires added to payroll.',
      progress: 100, timeSpent: 12,
      achievements: 'Zero payroll errors for the 3rd consecutive month. Successfully implemented new tax deductions.',
      blockers: 'None.',
      nextSteps: 'Begin annual salary review preparation. Update benefits calculations for Q4.',
      status: ReportStatus.APPROVED,
      submittedAt: daysAgo(7), reviewedAt: daysAgo(6),
      reviewerComment: 'Perfect execution as always.',
      authorId: member5.id, assignerId: teamLead3.id, taskId: task10.id,
    },
  });

  const report6 = await prisma.report.create({
    data: {
      title: 'Customer Satisfaction Analysis - Q2 2026',
      reportType: ReportType.MONTHLY_REPORT, period: ReportPeriod.MONTHLY,
      fromDate: new Date('2026-04-01'), toDate: new Date('2026-06-30'),
      summary: 'Q2 satisfaction score: 4.2/5.0 (up from 3.8 in Q1). Top praise: driver professionalism (62%). Top complaint: late arrivals (28%).',
      progress: 100, timeSpent: 8,
      achievements: 'Satisfaction score improved by 10.5%. Net Promoter Score reached +32.',
      blockers: 'Low survey response rate (only 23% of customers).',
      nextSteps: 'Launch incentive program for survey completion. Address late arrival issues with route optimization.',
      status: ReportStatus.APPROVED,
      submittedAt: daysAgo(9), reviewedAt: daysAgo(8),
      reviewerComment: 'Very insightful. The correlation between late arrivals and Zone 3 traffic is key.',
      authorId: member10.id, assignerId: teamLead1.id, taskId: task16.id,
    },
  });

  const report7 = await prisma.report.create({
    data: {
      title: 'Customer Complaint Resolution - Draft',
      reportType: ReportType.WEEKLY_REPORT, period: ReportPeriod.WEEKLY,
      fromDate: daysAgo(10), toDate: daysAgo(3),
      summary: 'Draft report on the redesigned complaint resolution workflow. Processing time reduced from 48h to 28h in pilot period.',
      progress: 60, timeSpent: 5,
      achievements: 'Pilot shows 42% reduction in resolution time. Customer follow-up satisfaction at 89%.',
      status: ReportStatus.DRAFT,
      authorId: member3.id, assignerId: teamLead1.id, taskId: task6.id,
    },
  });

  const report8 = await prisma.report.create({
    data: {
      title: 'Mobile App Bug Fix Progress',
      reportType: ReportType.WEEKLY_REPORT, period: ReportPeriod.WEEKLY,
      fromDate: daysAgo(7), toDate: new Date(),
      summary: 'Fixed 2 of 4 critical bugs. GPS drift resolved. Notification delivery fixed. Offline sync and cross-device testing remain.',
      progress: 70, timeSpent: 16,
      achievements: 'GPS accuracy improved from ±50m to ±5m. Notification delivery rate up from 82% to 99.2%.',
      status: ReportStatus.UNDER_REVIEW,
      submittedAt: hoursAgo(2),
      authorId: member4.id, assignerId: teamLead2.id, taskId: task14.id,
    },
  });

  // ─── Task Templates ─────────────────────────────────────────────────────────
  await prisma.taskTemplate.create({
    data: {
      name: 'Monthly Fleet Report',
      description: 'Template for monthly fleet operations report',
      title: 'Monthly Fleet Report - {MONTH} {YEAR}',
      taskDescription: 'Prepare the monthly fleet report including vehicle usage, maintenance, and costs.',
      priority: TaskPriority.HIGH, category: TaskCategory.OPERATIONS,
      estimatedHours: 16, creatorId: commander.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Weekly Operations Summary',
      description: 'Template for weekly operations summary',
      title: 'Weekly Operations Report - Week {WEEK}',
      taskDescription: 'Compile weekly operations data and prepare summary report.',
      priority: TaskPriority.MEDIUM, category: TaskCategory.OPERATIONS,
      estimatedHours: 8, creatorId: commander.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Vehicle Inspection Checklist',
      description: 'Template for quarterly vehicle inspections',
      title: 'Vehicle Inspection - Q{QUARTER} {YEAR}',
      taskDescription: 'Conduct comprehensive vehicle inspection covering engine, brakes, tires, electrical, and safety equipment.',
      priority: TaskPriority.HIGH, category: TaskCategory.MAINTENANCE,
      estimatedHours: 24, creatorId: commander.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Employee Onboarding',
      description: 'Template for new employee onboarding tasks',
      title: 'Onboarding - {EMPLOYEE_NAME}',
      taskDescription: 'Complete onboarding checklist including orientation, system access, training schedule, and 30-day review.',
      priority: TaskPriority.MEDIUM, category: TaskCategory.HR,
      estimatedHours: 12, creatorId: commander.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Customer Complaint Investigation',
      description: 'Template for investigating customer complaints',
      title: 'Complaint Investigation - {COMPLAINT_ID}',
      taskDescription: 'Investigate customer complaint: gather details, interview relevant parties, document findings, and propose resolution.',
      priority: TaskPriority.HIGH, category: TaskCategory.CUSTOMER_SUPPORT,
      estimatedHours: 6, creatorId: teamLead1.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Budget Proposal',
      description: 'Template for departmental budget proposals',
      title: 'Budget Proposal - {DEPARTMENT} - {YEAR}',
      taskDescription: 'Prepare annual budget proposal including departmental needs, forecasts, and ROI analysis.',
      priority: TaskPriority.HIGH, category: TaskCategory.FINANCE,
      estimatedHours: 40, creatorId: teamLead3.id,
    },
  });
  await prisma.taskTemplate.create({
    data: {
      name: 'Social Media Campaign',
      description: 'Template for social media marketing campaigns',
      title: 'Campaign - {CAMPAIGN_NAME}',
      taskDescription: 'Plan and execute social media campaign: create creatives, write copy, set up ads, schedule content, and monitor metrics.',
      priority: TaskPriority.MEDIUM, category: TaskCategory.MARKETING,
      estimatedHours: 30, creatorId: commander.id,
    },
  });

  // ─── System Settings ────────────────────────────────────────────────────────
  const settings = [
    { key: 'company_name', value: 'Taxime Transport PLC' },
    { key: 'timezone', value: 'Africa/Addis_Ababa' },
    { key: 'date_format', value: 'YYYY-MM-DD' },
    { key: 'default_task_priority', value: 'MEDIUM' },
    { key: 'deadline_reminder_days', value: '3' },
    { key: 'overdue_escalation_hours', value: '24' },
    { key: 'max_upload_size_mb', value: '25' },
    { key: 'allow_self_registration', value: 'true' },
    { key: 'notification_email_enabled', value: 'true' },
    { key: 'maintenance_mode', value: 'false' },
  ];
  for (const setting of settings) {
    await prisma.systemSetting.create({ data: setting });
  }

  // ─── User Settings ──────────────────────────────────────────────────────────
  const allUsers = [commander, teamLead1, teamLead2, teamLead3, member1, member2, member3, member4, member5, member6, member7, member8, member9, member10];
  for (const user of allUsers) {
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        emailNotifications: true,
        taskAssignedNotification: true,
        taskUpdatedNotification: true,
        taskDueNotification: true,
        commentMentionNotification: true,
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        profileVisibility: 'team',
        showEmail: false,
        showPhone: false,
      },
    });
  }

  // ─── Saved Filters ──────────────────────────────────────────────────────────
  await prisma.savedFilter.create({
    data: { name: 'My Overdue Tasks', filters: { status: 'OVERDUE', assigneeId: member2.id }, userId: member2.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'Team Critical Tasks', filters: { priority: 'CRITICAL', teamId: softwareTeam.id }, userId: teamLead2.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'Operations In Progress', filters: { status: 'IN_PROGRESS', departmentId: operations.id }, userId: teamLead1.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'All High Priority', filters: { priority: 'HIGH' }, userId: commander.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'My Active Tasks', filters: { assigneeId: member4.id, status: 'IN_PROGRESS' }, userId: member4.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'Finance Team Tasks', filters: { teamId: accounting.id }, userId: teamLead3.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'IT Pending Tasks', filters: { departmentId: technology.id, status: 'PENDING' }, userId: teamLead2.id },
  });
  await prisma.savedFilter.create({
    data: { name: 'Completed This Month', filters: { status: 'COMPLETED', departmentId: operations.id }, userId: teamLead1.id },
  });

  // ─── User Favorites ─────────────────────────────────────────────────────────
  await prisma.userFavorite.create({ data: { userId: member2.id, taskId: task1.id } });
  await prisma.userFavorite.create({ data: { userId: member4.id, taskId: task2.id } });
  await prisma.userFavorite.create({ data: { userId: commander.id, taskId: task2.id } });
  await prisma.userFavorite.create({ data: { userId: commander.id, taskId: task13.id } });
  await prisma.userFavorite.create({ data: { userId: teamLead1.id, taskId: task6.id } });
  await prisma.userFavorite.create({ data: { userId: member8.id, taskId: task5.id } });
  await prisma.userFavorite.create({ data: { userId: member5.id, taskId: task15.id } });
  await prisma.userFavorite.create({ data: { userId: teamLead3.id, taskId: task21.id } });

  // ─── Audit Logs ─────────────────────────────────────────────────────────────
  const auditLogs = [
    { action: AuditAction.LOGIN, entity: 'User', userId: commander.id, ip: '192.168.1.100', newValues: { method: 'password' } },
    { action: AuditAction.LOGIN, entity: 'User', userId: teamLead1.id, ip: '192.168.1.101', newValues: { method: 'password' } },
    { action: AuditAction.LOGIN, entity: 'User', userId: member4.id, ip: '10.0.0.55', newValues: { method: 'password' } },
    { action: AuditAction.CREATE, entity: 'Task', userId: commander.id, entityId: task1.id, newValues: { title: task1.title } },
    { action: AuditAction.CREATE, entity: 'Task', userId: commander.id, entityId: task2.id, newValues: { title: task2.title } },
    { action: AuditAction.STATUS_CHANGE, entity: 'Task', userId: member2.id, entityId: task1.id, oldValues: { status: 'PENDING' }, newValues: { status: 'IN_PROGRESS' } },
    { action: AuditAction.STATUS_CHANGE, entity: 'Task', userId: member8.id, entityId: task5.id, oldValues: { status: 'IN_PROGRESS' }, newValues: { status: 'SUBMITTED_FOR_REVIEW' } },
    { action: AuditAction.STATUS_CHANGE, entity: 'Task', userId: member5.id, entityId: task7.id, oldValues: { status: 'IN_PROGRESS' }, newValues: { status: 'COMPLETED' } },
    { action: AuditAction.STATUS_CHANGE, entity: 'Task', userId: member5.id, entityId: task10.id, oldValues: { status: 'IN_PROGRESS' }, newValues: { status: 'COMPLETED' } },
    { action: AuditAction.ASSIGN, entity: 'Task', userId: commander.id, entityId: task1.id, newValues: { assigneeId: member2.id } },
    { action: AuditAction.ASSIGN, entity: 'Task', userId: commander.id, entityId: task2.id, newValues: { assigneeId: member4.id } },
    { action: AuditAction.ASSIGN, entity: 'Task', userId: commander.id, entityId: task5.id, newValues: { assigneeId: member8.id } },
    { action: AuditAction.APPROVE, entity: 'Report', userId: teamLead1.id, entityId: report1.id, newValues: { status: 'APPROVED' } },
    { action: AuditAction.APPROVE, entity: 'Report', userId: teamLead3.id, entityId: report4.id, newValues: { status: 'APPROVED' } },
    { action: AuditAction.ROLE_CHANGE, entity: 'User', userId: commander.id, entityId: member6.id, oldValues: { position: 'Junior HR' }, newValues: { position: 'HR Specialist' } },
  ];
  for (const a of auditLogs) {
    await prisma.auditLog.create({ data: a as any });
  }

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('Database seeded successfully!');
  console.log('---');
  console.log(`Created:`);
  console.log(`  - 7 departments, 9 teams`);
  console.log(`  - 15 users (1 admin, 3 team leads, 11 members)`);
  console.log(`  - 10 tags`);
  console.log(`  - 22 tasks across all statuses`);
  console.log(`  - 27 subtasks`);
  console.log(`  - 15 comments`);
  console.log(`  - 18 notifications`);
  console.log(`  - 18 activity logs`);
  console.log(`  - 22 time entries`);
  console.log(`  - 8 reports across all statuses`);
  console.log(`  - 7 task templates`);
  console.log(`  - 10 system settings`);
  console.log(`  - 15 user settings`);
  console.log(`  - 8 saved filters`);
  console.log(`  - 8 favorites`);
  console.log(`  - 15 audit logs`);
  console.log('---');
  console.log('Default login credentials (password: password123):');
  console.log('  Admin:      commander@taxime.com');
  console.log('  Team Lead:  hana@taxime.com / dawit@taxime.com / fatima@taxime.com');
  console.log('  Member:     arsema@taxime.com / sara@taxime.com / abel@taxime.com');
  console.log('  Member:     meron@taxime.com / yonas@taxime.com / liya@taxime.com');
  console.log('  Member:     kaleb@taxime.com / nadia@taxime.com / samuel@taxime.com');
  console.log('  Member:     helen@taxime.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
