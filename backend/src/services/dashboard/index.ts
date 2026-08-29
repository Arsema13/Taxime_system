import { DashboardCommanderService } from './dashboard-commander.service';
import { DashboardTeamLeadService } from './dashboard-team-lead.service';
import { DashboardMemberService } from './dashboard-member.service';

export class DashboardService {
  private commanderService = new DashboardCommanderService();
  private teamLeadService = new DashboardTeamLeadService();
  private memberService = new DashboardMemberService();

  async getCommanderDashboard() {
    return this.commanderService.getCommanderDashboard();
  }

  async getTeamLeadDashboard(userId: string) {
    return this.teamLeadService.getTeamLeadDashboard(userId);
  }

  async getMemberDashboard(userId: string) {
    return this.memberService.getMemberDashboard(userId);
  }
}

export const dashboardService = new DashboardService();
