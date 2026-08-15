import { Module } from '@nestjs/common';
import { AdvancesController } from './advances.controller';
import { AdvancesService } from './advances.service';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { WorkRecordsController } from './work-records.controller';
import { WorkRecordsService } from './work-records.service';

@Module({
  controllers: [
    AdvancesController,
    EmploymentTypesController,
    TeamMembersController,
    WorkRecordsController,
  ],
  providers: [
    AdvancesService,
    EmploymentTypesService,
    TeamMembersService,
    WorkRecordsService,
  ],
})
export class TeamModule {}
