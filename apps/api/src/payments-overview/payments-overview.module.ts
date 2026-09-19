import { Module } from '@nestjs/common';
import { PaymentsOverviewController } from './payments-overview.controller';
import { PaymentsOverviewService } from './payments-overview.service';

@Module({
  controllers: [PaymentsOverviewController],
  providers: [PaymentsOverviewService],
})
export class PaymentsOverviewModule {}
