import { Global, Module } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';
import { PushSubscriptionsController } from './push-subscriptions.controller';

// Global like PrismaModule (both are used from many otherwise-unrelated
// feature modules — DSR, Purchases, Site Contracts, Payments — each firing
// a push as a side effect of its own create()) rather than importing this
// module individually into every one of them.
@Global()
@Module({
  controllers: [PushSubscriptionsController],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
