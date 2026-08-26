import { Module } from '@nestjs/common';
import { DsrModule } from '../dsr/dsr.module';
import { InventoryModule } from '../inventory/inventory.module';
import { StorageModule } from '../storage/storage.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import {
  EMAIL_SENDER,
  WHATSAPP_SENDER,
  NotConfiguredWhatsAppSender,
  ResendEmailSender,
} from './report-senders';

// Story 13.2: like DashboardModule, ReportsModule imports each owning epic's
// module solely to reuse that domain's existing service methods (DsrModule's
// DailySiteReport queries, InventoryModule's stock/transaction lists) rather
// than re-query those tables from the Reports composition layer. StorageModule
// provides the presigned-URL reads the Site photo gallery needs.
@Module({
  imports: [DsrModule, InventoryModule, StorageModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    SiteInventoryReportsService,
    ReportCompilerService,
    ReportDeliveryService,
    { provide: EMAIL_SENDER, useClass: ResendEmailSender },
    { provide: WHATSAPP_SENDER, useClass: NotConfiguredWhatsAppSender },
  ],
})
export class ReportsModule {}
