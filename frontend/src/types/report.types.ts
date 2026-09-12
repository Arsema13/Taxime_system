export type ReportType = 'TASK_REPORT' | 'DAILY_SUMMARY' | 'WEEKLY_REPORT' | 'MONTHLY_REPORT' | 'YEARLY_REPORT';
export type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';

export type TaskReport = Report;

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  period: ReportPeriod;
  fromDate: string;
  toDate: string;
  summary: string;
  progress: number;
  timeSpent?: number;
  blockers?: string;
  achievements?: string;
  nextSteps?: string;
  status: ReportStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerComment?: string;
  authorId: string;
  author: ReportUser;
  assignerId?: string;
  assigner?: ReportUser;
  taskId?: string;
  task?: ReportTask;
  createdAt: string;
  updatedAt: string;
}

export interface ReportUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email?: string;
}

export interface ReportTask {
  id: string;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface ReportStats {
  total: number;
  drafts: number;
  submitted: number;
  approved: number;
  rejected: number;
  revisionNeeded: number;
}

export interface CreateReportInput {
  title: string;
  reportType?: ReportType;
  period?: ReportPeriod;
  fromDate: string;
  toDate: string;
  summary: string;
  progress?: number;
  timeSpent?: number;
  blockers?: string;
  achievements?: string;
  nextSteps?: string;
  taskId?: string;
}

export interface UpdateReportInput {
  title?: string;
  summary?: string;
  progress?: number;
  timeSpent?: number;
  blockers?: string;
  achievements?: string;
  nextSteps?: string;
  reviewerComment?: string;
}

export interface ReviewReportInput {
  status: 'APPROVED' | 'REJECTED' | 'REVISION_NEEDED';
  reviewerComment?: string;
}

export interface CombineReportsInput {
  reportIds: string[];
  title?: string;
  summary?: string;
  progress?: number;
  timeSpent?: number;
  blockers?: string;
  achievements?: string;
  nextSteps?: string;
  period?: ReportPeriod;
  reportType?: ReportType;
  sendToAdmin?: boolean;
  reviewerComment?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reportType?: ReportType;
  period?: ReportPeriod;
  fromDate?: string;
  toDate?: string;
  authorId?: string;
  teamId?: string;
}
