export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMMENTED'
  | 'TASK_MENTIONED'
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'TASK_OVERDUE'
  | 'TASK_DUE_SOON'
  | 'TASK_REASSIGNED'
  | 'TASK_SUBMITTED'
  | 'FILE_UPLOADED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown> | null;
  userId: string;
  taskId?: string | null;
  task?: { id: string; title: string } | null;
  createdAt: string;
}

export interface NotificationPreferences {
  emailOnAssign: boolean;
  emailOnStatusChange: boolean;
  emailOnComment: boolean;
  emailOnMention: boolean;
  emailOnApproval: boolean;
  emailOnOverdue: boolean;
  inAppOnAssign: boolean;
  inAppOnStatusChange: boolean;
  inAppOnComment: boolean;
  inAppOnMention: boolean;
  inAppOnApproval: boolean;
  inAppOnOverdue: boolean;
}
