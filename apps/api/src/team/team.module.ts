import { Module } from '@nestjs/common';
import { AdvanceAdjustmentsController } from './advance-adjustments.controller';
import { AdvanceAdjustmentsService } from './advance-adjustments.service';
import { AdvancesController } from './advances.controller';
import { AdvancesService } from './advances.service';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { WorkRecordsController } from './work-records.controller';
import { WorkRecordsService } from './work-records.service';

@Module({
  controllers: [
    AdvanceAdjustmentsController,
    AdvancesController,
    EmploymentTypesController,
    PaymentsController,
    TeamMembersController,
    WorkRecordsController,
  ],
  providers: [
    AdvanceAdjustmentsService,
    AdvancesService,
    EmploymentTypesService,
    PaymentsService,
    TeamMembersService,
    WorkRecordsService,
  ],
  // Exported so DashboardModule can reuse TeamMembersService's
  // todaysWorkingHeadcount (Story 12.1) and getOutstandingAdvances, plus
  // PaymentsService.countPending (Story 12.2) — rather than recompute them.
  exports: [TeamMembersService, PaymentsService],
})
export class TeamModule {}
