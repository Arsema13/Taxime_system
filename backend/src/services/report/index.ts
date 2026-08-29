import { ReportTaskSummaryService } from './report-task-summary.service';
import { ReportEmployeeService } from './report-employee.service';
import { ReportTeamService } from './report-team.service';
import { ReportDepartmentService } from './report-department.service';
import { ReportOverdueService } from './report-overdue.service';
import { ReportHistoryService } from './report-history.service';
import { ReportTimelineService } from './report-timeline.service';
import { ReportExportService } from './report-export.service';

export class ReportService {
  private taskSummary = new ReportTaskSummaryService();
  private employee = new ReportEmployeeService();
  private team = new ReportTeamService();
  private department = new ReportDepartmentService();
  private overdue = new ReportOverdueService();
  private history = new ReportHistoryService();
  private timeline = new ReportTimelineService();
  private exportService = new ReportExportService();

  async generateTaskSummary(query: any) {
    return this.taskSummary.generateTaskSummary(query);
  }

  async generateEmployeePerformance(query: any) {
    return this.employee.generateEmployeePerformance(query);
  }

  async generateTeamPerformance(query: any) {
    return this.team.generateTeamPerformance(query);
  }

  async generateDepartmentReport(query: any) {
    return this.department.generateDepartmentReport(query);
  }

  async generateOverdueReport(query: any) {
    return this.overdue.generateOverdueReport(query);
  }

  async generateTaskHistory(query: any) {
    return this.history.generateTaskHistory(query);
  }

  async generateCompletionTimeline(query: any) {
    return this.timeline.generateCompletionTimeline(query);
  }

  async exportToExcel(reportData: any): Promise<Buffer> {
    return this.exportService.exportToExcel(reportData);
  }

  async exportToPDF(reportData: any): Promise<Buffer> {
    return this.exportService.exportToPDF(reportData);
  }
}

export const reportService = new ReportService();
