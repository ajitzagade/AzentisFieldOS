import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { SitesModule } from '../sites/sites.module';
import { TeamModule } from '../team/team.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Its own module (Story 12.1/12.2): a read-aggregation layer that owns no
// data of its own. It imports each owning epic's module solely to reuse that
// domain's existing service methods rather than re-query the tables here —
// TeamModule for todaysWorkingHeadcount/getOutstandingAdvances/countPending,
// SitesModule for SitesService.list(), InventoryModule for
// getLowStockMaterials(). Every figure on the Dashboard is composition.
@Module({
  imports: [TeamModule, SitesModule, InventoryModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
