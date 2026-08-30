export interface StatCard {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TaskStatusCount {
  status: string;
  count: number;
}

export interface TaskPriorityCount {
  priority: string;
  count: number;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  created: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  department: string;
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface TeamPerformance {
  teamId: string;
  team: string;
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface EmployeeWorkload {
  userId: string;
  name: string;
  avatar?: string | null;
  role: string;
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export interface CommanderDashboard {
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    criticalTasks: number;
    pendingReview: number;
    completionRate: number;
  };
  tasksByStatus: TaskStatusCount[];
  tasksByPriority: TaskPriorityCount[];
  completionTrend: CompletionTrend[];
  departmentPerformance: DepartmentPerformance[];
  teamPerformance: TeamPerformance[];
  employeeWorkload: EmployeeWorkload[];
  recentActivity: RecentActivity[];
}

export interface TeamLeadDashboard {
  stats: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    pendingReview: number;
    completionRate: number;
    teamSize: number;
  };
  tasksByStatus: TaskStatusCount[];
  memberWorkload: EmployeeWorkload[];
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
}

export interface MemberDashboard {
  stats: {
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
    inProgressTasks: number;
    completionRate: number;
    pendingTasks: number;
  };
  tasksByStatus: TaskStatusCount[];
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
}

export interface RecentActivity {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  taskId?: string | null;
  taskTitle?: string | null;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  createdAt: string;
}

export interface UpcomingDeadline {
  taskId: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  daysLeft: number;
}
