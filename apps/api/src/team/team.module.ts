import { Module } from '@nestjs/common';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';
import { TeamMembersController } from './team-members.controller';
import { TeamMembersService } from './team-members.service';
import { WorkRecordsController } from './work-records.controller';
import { WorkRecordsService } from './work-records.service';

@Module({
  controllers: [
    EmploymentTypesController,
    TeamMembersController,
    WorkRecordsController,
  ],
  providers: [
    EmploymentTypesService,
    TeamMembersService,
    WorkRecordsService,
  ],
})
export class TeamModule {}
