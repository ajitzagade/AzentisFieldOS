import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateNotificationChannelSettingInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Story 14.4 (FR-50): reads/writes the NotificationChannelSetting rows the
// admin edits and ReportDeliveryService reads at send time. Configuration
// record, edited in place (not an AD-9 correction) — same category as
// BrandingConfig.
@Injectable()
export class NotificationSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.notificationChannelSetting.findMany({
      orderBy: { channel: 'asc' },
    });
  }

  async update(channel: string, input: UpdateNotificationChannelSettingInput) {
    try {
      return await this.prisma.notificationChannelSetting.update({
        where: { channel },
        // recipientUserIds is a scalar list — assigning the array replaces it.
        data: {
          enabled: input.enabled,
          recipientUserIds: input.recipientUserIds,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `Notification channel ${channel} not found`,
        );
      }
      throw error;
    }
  }
}
