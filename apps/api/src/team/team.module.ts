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
})
export class TeamModule {}
