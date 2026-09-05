import { Body, Controller, Delete, Post } from '@nestjs/common';
import {
  createPushSubscriptionSchema,
  deletePushSubscriptionSchema,
  type CreatePushSubscriptionInput,
  type DeletePushSubscriptionInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { PushNotificationsService } from './push-notifications.service';

// Both roles can subscribe — Owner/Admin and Site Supervisor both receive
// pushes (see the trigger wiring in dsr/purchases/site-contracts/payments
// services), so this is the default CustomAuthGuard only (authenticated,
// any role), no @Roles restriction.
@Controller('push-subscriptions')
export class PushSubscriptionsController {
  constructor(private readonly pushNotifications: PushNotificationsService) {}

  @Post()
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createPushSubscriptionSchema))
    body: CreatePushSubscriptionInput,
  ): Promise<{ ok: true }> {
    await this.pushNotifications.subscribe(
      user.id,
      body.endpoint,
      body.keys.p256dh,
      body.keys.auth,
    );
    return { ok: true };
  }

  // The browser subscription object identifies the registration to remove;
  // there is no other reliable key from a client that never received an id.
  // Scoped to the calling user (see PushNotificationsService.unsubscribe) —
  // this can only ever delete the caller's own subscription.
  @Delete()
  async unsubscribe(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deletePushSubscriptionSchema))
    body: DeletePushSubscriptionInput,
  ): Promise<{ ok: true }> {
    await this.pushNotifications.unsubscribe(body.endpoint, user.id);
    return { ok: true };
  }
}
