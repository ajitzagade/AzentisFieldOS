import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [StorageModule],
  controllers: [SitesController],
  providers: [SitesService],
  // Exported so DashboardModule (Story 12.2) can reuse SitesService.list()'s
  // Site query rather than re-query `Site` from DashboardService.
  exports: [SitesService],
})
export class SitesModule {}
