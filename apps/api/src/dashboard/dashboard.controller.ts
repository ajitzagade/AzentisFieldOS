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
}
