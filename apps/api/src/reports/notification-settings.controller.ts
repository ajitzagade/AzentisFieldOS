import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  updateNotificationChannelSettingSchema,
  type UpdateNotificationChannelSettingInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { NotificationSettingsService } from './notification-settings.service';

// Story 14.4 (FR-50): who receives automated reports, on which channels, is an
// Owner/Admin-only surface — both routes are @Roles('OWNER_ADMIN') (mirrors
// UsersController). The webhook/cron paths that actually SEND reports are
// @Public + CRON_SECRET-gated elsewhere; this controller is only the admin
// configuration API. Keyed by `channel` in the path, not the body.
@Controller('notification-settings')
@UseGuards(RolesGuard)
export class NotificationSettingsController {
  constructor(private readonly service: NotificationSettingsService) {}

  @Get()
  @Roles('OWNER_ADMIN')
  list() {
    return this.service.list();
  }

  @Patch(':channel')
  @Roles('OWNER_ADMIN')
  update(
    @Param('channel') channel: string,
    @Body(new ZodValidationPipe(updateNotificationChannelSettingSchema))
    body: UpdateNotificationChannelSettingInput,
  ) {
    return this.service.update(channel, body);
  }
}
