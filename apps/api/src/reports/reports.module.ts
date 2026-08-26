import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import {
  EMAIL_SENDER,
  WHATSAPP_SENDER,
  NotConfiguredWhatsAppSender,
  ResendEmailSender,
} from './report-senders';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportCompilerService,
    ReportDeliveryService,
    { provide: EMAIL_SENDER, useClass: ResendEmailSender },
    { provide: WHATSAPP_SENDER, useClass: NotConfiguredWhatsAppSender },
  ],
})
export class ReportsModule {}
