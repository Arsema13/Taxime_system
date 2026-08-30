export type TaskStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'REJECTED'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'OVERDUE';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskCategory =
  | 'OPERATIONS'
  | 'ADMINISTRATION'
  | 'FINANCE'
  | 'HR'
  | 'IT'
  | 'MAINTENANCE'
  | 'CUSTOMER_SUPPORT'
  | 'MARKETING'
  | 'DOCUMENTATION'
  | 'MANAGEMENT'
  | 'OTHER';

export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface TaskAssignee {
  id: string;
  userId: string;
  isPrimary: boolean;
  assignedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    email: string;
    role: string;
  };
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
  taskId: string;
  creatorId: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  progress: number;
  estimatedHours?: number | null;
  actualHours?: number | null;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  isRecurring: boolean;
  recurrenceType?: RecurrenceType | null;
  location?: string | null;
  vehicleReference?: string | null;
  customerReference?: string | null;
  externalRef?: string | null;
  isArchived: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  assignees: TaskAssignee[];
  subtasks: Subtask[];
  tags: { tag: Tag }[];
  _count?: {
    comments: number;
    attachments: number;
    subtasks: number;
  };
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  startDate?: string;
  estimatedHours?: number;
  departmentId?: string;
  teamId?: string;
  assigneeIds?: string[];
  tagIds?: string[];
  location?: string;
  vehicleReference?: string;
  customerReference?: string;
  externalRef?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatus;
  progress?: number;
  actualHours?: number;
  isArchived?: boolean;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority;
  category?: TaskCategory;
  departmentId?: string;
  teamId?: string;
  assigneeId?: string;
  creatorId?: string;
  fromDate?: string;
  toDate?: string;
  isArchived?: boolean;
  isFavorite?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Comment {
  id: string;
  content: string;
  isEdited: boolean;
  taskId: string;
  authorId: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    role: string;
  };
  replies?: Comment[];
  mentions?: { userId: string; user: { firstName: string; lastName: string } }[];
}

export interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  taskId?: string | null;
  uploaderId: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details?: Record<string, unknown> | null;
  taskId?: string | null;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string | null;
  title: string;
  taskDescription?: string | null;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedHours?: number | null;
  isActive: boolean;
  createdAt: string;
  creator: { id: string; firstName: string; lastName: string };
}

export interface WorkloadItem {
  userId: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string | null };
  taskCount: number;
  completedCount: number;
  overdueCount: number;
}
