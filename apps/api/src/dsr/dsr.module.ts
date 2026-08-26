import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { DsrController } from './dsr.controller';
import { DsrService } from './dsr.service';

@Module({
  imports: [StorageModule],
  controllers: [DsrController],
  providers: [DsrService],
  // Exported so ReportsModule (Story 13.2) can reuse DsrService's
  // DailySiteReport queries (listBySiteInRange) rather than re-query the
  // table from the Reports composition layer.
  exports: [DsrService],
})
export class DsrModule {}
