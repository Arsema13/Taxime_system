import { PrismaClient, Role, TaskStatus, TaskPriority, TaskCategory, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding database...');

  // Create departments
  const management = await prisma.department.create({ data: { name: 'Management', description: 'Executive management' } });
  const operations = await prisma.department.create({ data: { name: 'Operations', description: 'Transport operations' } });
  const finance = await prisma.department.create({ data: { name: 'Finance', description: 'Financial operations' } });
  const hr = await prisma.department.create({ data: { name: 'Human Resources', description: 'HR management' } });
  const technology = await prisma.department.create({ data: { name: 'Technology', description: 'IT and software' } });
  const marketing = await prisma.department.create({ data: { name: 'Marketing', description: 'Marketing and outreach' } });

  // Create teams
  const dispatch = await prisma.team.create({ data: { name: 'Dispatch', departmentId: operations.id } });
  const fleetOps = await prisma.team.create({ data: { name: 'Fleet Operations', departmentId: operations.id } });
  const customerSupport = await prisma.team.create({ data: { name: 'Customer Support', departmentId: operations.id } });
  const softwareTeam = await prisma.team.create({ data: { name: 'Software', departmentId: technology.id } });
  const itSupport = await prisma.team.create({ data: { name: 'IT Support', departmentId: technology.id } });

  // Create users
  const hashedPassword = await hashPassword('password123');

  const commander = await prisma.user.create({
    data: {
      email: 'commander@taxime.com', password: hashedPassword,
      firstName: 'Abebe', lastName: 'Kebede', role: Role.COMMANDER,
      position: 'Operations Director', departmentId: management.id,
      status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const teamLead1 = await prisma.user.create({
    data: {
      email: 'hana@taxime.com', password: hashedPassword,
      firstName: 'Hana', lastName: 'Tadesse', role: Role.TEAM_LEAD,
      position: 'Team Lead - Operations', departmentId: operations.id,
      teamId: dispatch.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const teamLead2 = await prisma.user.create({
    data: {
      email: 'dawit@taxime.com', password: hashedPassword,
      firstName: 'Dawit', lastName: 'Haile', role: Role.TEAM_LEAD,
      position: 'Team Lead - Technology', departmentId: technology.id,
      teamId: softwareTeam.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'arsema@taxime.com', password: hashedPassword,
      firstName: 'Arsema', lastName: 'Mulugeta', role: Role.MEMBER,
      position: 'Operations Specialist', departmentId: operations.id,
      teamId: dispatch.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'sara@taxime.com', password: hashedPassword,
      firstName: 'Sara', lastName: 'Bekele', role: Role.MEMBER,
      position: 'Fleet Coordinator', departmentId: operations.id,
      teamId: fleetOps.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const member3 = await prisma.user.create({
    data: {
      email: 'abel@taxime.com', password: hashedPassword,
      firstName: 'Abel', lastName: 'Dereje', role: Role.MEMBER,
      position: 'Support Agent', departmentId: operations.id,
      teamId: customerSupport.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  const member4 = await prisma.user.create({
    data: {
      email: 'meron@taxime.com', password: hashedPassword,
      firstName: 'Meron', lastName: 'Abebe', role: Role.MEMBER,
      position: 'Software Developer', departmentId: technology.id,
      teamId: softwareTeam.id,       status: UserStatus.ACTIVE, emailVerified: true,
    },
  });

  // Create tags
  const urgentTag = await prisma.tag.create({ data: { name: 'urgent', color: '#ef4444' } });
  const monthlyTag = await prisma.tag.create({ data: { name: 'monthly', color: '#3b82f6' } });
  await prisma.tag.create({ data: { name: 'internal', color: '#6b7280' } });

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Prepare Monthly Fleet Report',
      description: 'Compile and prepare the monthly fleet operations report including vehicle usage, maintenance costs, and performance metrics.',
      status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH,
      category: TaskCategory.OPERATIONS, progress: 40,
      dueDate: new Date('2026-09-15'), estimatedHours: 16,
      creatorId: commander.id, departmentId: operations.id,
      teamId: fleetOps.id,
    },
  });

  await prisma.taskAssignee.create({ data: { taskId: task1.id, userId: member2.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task1.id, tagId: monthlyTag.id } });

  const task2 = await prisma.task.create({
    data: {
      title: 'Update Dispatch System',
      description: 'Implement new routing algorithm for the dispatch system to optimize vehicle allocation.',
      status: TaskStatus.PENDING, priority: TaskPriority.CRITICAL,
      category: TaskCategory.IT, progress: 0,
      dueDate: new Date('2026-09-30'), estimatedHours: 40,
      creatorId: commander.id, departmentId: technology.id,
      teamId: softwareTeam.id,
    },
  });

  await prisma.taskAssignee.create({ data: { taskId: task2.id, userId: member4.id, isPrimary: true } });
  await prisma.taskAssignee.create({ data: { taskId: task2.id, userId: teamLead2.id, isPrimary: false } });
  await prisma.taskTag.create({ data: { taskId: task2.id, tagId: urgentTag.id } });

  const task3 = await prisma.task.create({
    data: {
      title: 'Weekly Operations Report',
      description: 'Prepare the weekly operations summary report for management review.',
      status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM,
      category: TaskCategory.OPERATIONS, progress: 100,
      dueDate: new Date('2026-08-25'), estimatedHours: 8,
      completedAt: new Date('2026-08-24'),
      creatorId: teamLead1.id, departmentId: operations.id,
      teamId: dispatch.id,
    },
  });

  await prisma.taskAssignee.create({ data: { taskId: task3.id, userId: member1.id, isPrimary: true } });
  await prisma.taskTag.create({ data: { taskId: task3.id, tagId: monthlyTag.id } });

  const task4 = await prisma.task.create({
    data: {
      title: 'Driver Training Schedule',
      description: 'Create and distribute the quarterly driver training schedule.',
      status: TaskStatus.PENDING, priority: TaskPriority.LOW,
      category: TaskCategory.HR, progress: 0,
      dueDate: new Date('2026-09-10'), estimatedHours: 6,
      creatorId: commander.id, departmentId: hr.id,
    },
  });

  await prisma.taskAssignee.create({ data: { taskId: task4.id, userId: member3.id, isPrimary: true } });

  // Create subtasks for task1
  await prisma.subtask.create({
    data: { title: 'Collect vehicle data', isCompleted: true, order: 0, taskId: task1.id, creatorId: commander.id },
  });
  await prisma.subtask.create({
    data: { title: 'Review maintenance records', isCompleted: true, order: 1, taskId: task1.id, creatorId: commander.id },
  });
  await prisma.subtask.create({
    data: { title: 'Analyze fuel consumption', isCompleted: false, order: 2, taskId: task1.id, creatorId: commander.id },
  });
  await prisma.subtask.create({
    data: { title: 'Calculate performance metrics', isCompleted: false, order: 3, taskId: task1.id, creatorId: commander.id },
  });
  await prisma.subtask.create({
    data: { title: 'Prepare report document', isCompleted: false, order: 4, taskId: task1.id, creatorId: commander.id },
  });
  await prisma.subtask.create({
    data: { title: 'Submit to management', isCompleted: false, order: 5, taskId: task1.id, creatorId: commander.id },
  });

  // Create dependency: task2 depends on task3
  await prisma.taskDependency.create({ data: { taskId: task2.id, dependsOnId: task3.id } });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'I\'ve started collecting the vehicle data. Should have it ready by end of day.',
      taskId: task1.id, authorId: member2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Please make sure to include the maintenance costs for this month.',
      taskId: task1.id, authorId: teamLead1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: '@Arsema Can you verify the vehicle records before we submit?',
      taskId: task1.id, authorId: teamLead1.id,
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      type: 'TASK_ASSIGNED', title: 'New Task Assigned',
      message: 'You have been assigned to "Prepare Monthly Fleet Report"',
      userId: member2.id, taskId: task1.id, actorId: commander.id,
    },
  });

  await prisma.notification.create({
    data: {
      type: 'TASK_ASSIGNED', title: 'New Task Assigned',
      message: 'You have been assigned to "Update Dispatch System"',
      userId: member4.id, taskId: task2.id, actorId: commander.id,
    },
  });

  // Create activity logs
  await prisma.activityLog.create({
    data: { taskId: task1.id, userId: commander.id, action: 'Task created', details: { title: task1.title } },
  });
  await prisma.activityLog.create({
    data: { taskId: task1.id, userId: commander.id, action: 'Task assigned to Sara Bekele', details: { assigneeId: member2.id } },
  });
  await prisma.activityLog.create({
    data: { taskId: task1.id, userId: member2.id, action: 'Status changed to IN_PROGRESS', details: { from: 'PENDING', to: 'IN_PROGRESS' } },
  });
  await prisma.activityLog.create({
    data: { taskId: task1.id, userId: member2.id, action: 'Progress updated to 40%', details: { progress: 40 } },
  });

  // Create task templates
  await prisma.taskTemplate.create({
    data: {
      name: 'Monthly Fleet Report',
      description: 'Template for monthly fleet operations report',
      title: 'Monthly Fleet Report - {MONTH} {YEAR}',
      taskDescription: 'Prepare the monthly fleet report including vehicle usage, maintenance, and costs.',
      priority: TaskPriority.HIGH,
      category: TaskCategory.OPERATIONS,
      estimatedHours: 16,
      creatorId: commander.id,
    },
  });

  await prisma.taskTemplate.create({
    data: {
      name: 'Weekly Operations Summary',
      description: 'Template for weekly operations summary',
      title: 'Weekly Operations Report - Week {WEEK}',
      taskDescription: 'Compile weekly operations data and prepare summary report.',
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.OPERATIONS,
      estimatedHours: 8,
      creatorId: commander.id,
    },
  });

  // Create system settings
  const settings = [
    { key: 'company_name', value: 'Taxime Transport PLC' },
    { key: 'timezone', value: 'Africa/Addis_Ababa' },
    { key: 'date_format', value: 'YYYY-MM-DD' },
    { key: 'default_task_priority', value: 'MEDIUM' },
    { key: 'deadline_reminder_days', value: '3' },
    { key: 'overdue_escalation_hours', value: '24' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.create({ data: setting });
  }

  // Create time entries
  await prisma.taskTimeEntry.create({
    data: {
      taskId: task1.id, userId: member2.id,
      description: 'Collecting vehicle data from fleet management system',
      startTime: new Date('2026-08-28T09:00:00Z'),
      endTime: new Date('2026-08-28T11:30:00Z'),
      duration: 9000,
    },
  });
  await prisma.taskTimeEntry.create({
    data: {
      taskId: task1.id, userId: member2.id,
      description: 'Reviewing maintenance records',
      startTime: new Date('2026-08-28T14:00:00Z'),
      endTime: new Date('2026-08-28T16:00:00Z'),
      duration: 7200,
    },
  });
  await prisma.taskTimeEntry.create({
    data: {
      taskId: task2.id, userId: member4.id,
      description: 'Designing routing algorithm architecture',
      startTime: new Date('2026-08-29T08:00:00Z'),
      endTime: new Date('2026-08-29T12:00:00Z'),
      duration: 14400,
    },
  });

  // Create user favorites
  await prisma.userFavorite.create({ data: { userId: member2.id, taskId: task1.id } });
  await prisma.userFavorite.create({ data: { userId: member4.id, taskId: task2.id } });
  await prisma.userFavorite.create({ data: { userId: commander.id, taskId: task2.id } });

  // Create saved filters
  await prisma.savedFilter.create({
    data: {
      name: 'My Overdue Tasks',
      filters: { status: 'OVERDUE', assigneeId: member2.id },
      userId: member2.id,
    },
  });
  await prisma.savedFilter.create({
    data: {
      name: 'Team Critical Tasks',
      filters: { priority: 'CRITICAL', teamId: softwareTeam.id },
      userId: teamLead2.id,
    },
  });
  await prisma.savedFilter.create({
    data: {
      name: 'Operations In Progress',
      filters: { status: 'IN_PROGRESS', departmentId: operations.id },
      userId: teamLead1.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('---');
  console.log('Default login credentials:');
  console.log('Commander: commander@taxime.com / password123');
  console.log('Team Lead: hana@taxime.com / password123');
  console.log('Member:    arsema@taxime.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
