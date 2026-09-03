import { Module } from '@nestjs/common';
import { SitesModule } from '../sites/sites.module';
import { MaterialsModule } from '../materials/materials.module';
import { VendorsModule } from '../vendors/vendors.module';
import { TeamModule } from '../team/team.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SubcontractorsModule } from '../subcontractors/subcontractors.module';
import { RmcModule } from '../rmc/rmc.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { WasteDisposalModule } from '../waste-disposal/waste-disposal.module';
import { AssetsModule } from '../assets/assets.module';
import { DsrModule } from '../dsr/dsr.module';
import { AuditModule } from '../audit/audit.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  // Story 19.2/16.6: fanned out to every major entity's own
  // searchCandidates() — SearchModule never queries Prisma directly for any
  // of these, it only composes each owning module's existing service.
  imports: [
    SitesModule,
    MaterialsModule,
    VendorsModule,
    TeamModule,
    InventoryModule,
    SubcontractorsModule,
    RmcModule,
    ExpensesModule,
    WasteDisposalModule,
    AssetsModule,
    DsrModule,
    AuditModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
