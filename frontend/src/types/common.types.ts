export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export type SortOrder = 'asc' | 'desc';

export interface DateRange {
  from?: string;
  to?: string;
}

export interface UserSettings {
  id?: string;
  userId?: string;
  emailNotifications?: boolean;
  taskAssignedNotification?: boolean;
  taskUpdatedNotification?: boolean;
  taskDueNotification?: boolean;
  commentMentionNotification?: boolean;
  theme?: string;
  dateFormat?: string;
  timeFormat?: string;
  profileVisibility?: string;
  showEmail?: boolean;
  showPhone?: boolean;
}

