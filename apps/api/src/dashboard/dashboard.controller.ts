import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

// Story 12.1: the Owner/Admin Dashboard's cross-Site "Today" rollup (SM-3,
// FR-35). Read-only aggregation — no write endpoints live here.
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('today')
  getToday() {
    return this.dashboardService.getToday();
  }

  // Story 12.2 (FR-34): the cross-Site "Overall" rollup — active Sites,
  // inventory status, outstanding Advances, pending payments — each composed
  // from its owning epic's service.
  @Get('overall')
  getOverall() {
    return this.dashboardService.getOverall();
  }

  // The small Site-card grid below Overall (Story 12.2).
  @Get('sites-preview')
  getSitesPreview() {
    return this.dashboardService.getSitesPreview();
  }

  // Command Center redesign (2026-09-08): today's activity per Site plus
  // the Godown's received-only bucket, for the "Site operations" table.
  // No @Roles, matching the rest of this controller.
  @Get('site-breakdown')
  getSiteBreakdown() {
    return this.dashboardService.getSiteBreakdown();
  }

  // Command Center redesign (2026-09-08): the 7-day series behind the
  // band's sparklines (sites reporting / labour working / expenses).
  @Get('trends')
  getTrends() {
    return this.dashboardService.getTrends();
  }
}
