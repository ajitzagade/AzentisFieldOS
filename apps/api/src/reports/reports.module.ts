import { Module } from '@nestjs/common';
import { DsrModule } from '../dsr/dsr.module';
import { InventoryModule } from '../inventory/inventory.module';
import { StorageModule } from '../storage/storage.module';
import { TeamModule } from '../team/team.module';
import { AssetsModule } from '../assets/assets.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { LabourReportsService } from './labour-reports.service';
import { MachineryVehicleReportsService } from './machinery-reports.service';
import { FinancialReportsService } from './financial-reports.service';
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
// provides the presigned-URL reads the Site photo gallery needs. Story 13.3
// adds TeamModule (WorkRecord/Payment/Advance/AdvanceAdjustment history +
// summary) and AssetsModule (Machinery/Vehicle status + movement/service
// history) for the Labour and Machinery/Vehicle report views. Story 13.4's
// FinancialReportsService needs no extra module import — its five cost-category
// SUMs read the (global) PrismaService directly rather than re-deriving any
// owning epic's business logic.
@Module({
  imports: [
    DsrModule,
    InventoryModule,
    StorageModule,
    TeamModule,
    AssetsModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    SiteInventoryReportsService,
    LabourReportsService,
    MachineryVehicleReportsService,
    FinancialReportsService,
    ReportCompilerService,
    ReportDeliveryService,
    { provide: EMAIL_SENDER, useClass: ResendEmailSender },
    { provide: WHATSAPP_SENDER, useClass: NotConfiguredWhatsAppSender },
  ],
})
export class ReportsModule {}
