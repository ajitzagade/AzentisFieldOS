import { Module } from '@nestjs/common';
import { TeamModule } from '../team/team.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Its own module (Story 12.1): a read-aggregation layer that owns no data of
// its own. It imports TeamModule solely to reuse TeamMembersService's
// todaysWorkingHeadcount rather than recompute it (Epic 6 Story 6.3).
@Module({
  imports: [TeamModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
