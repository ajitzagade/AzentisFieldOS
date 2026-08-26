import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { updateNotificationChannelSettingSchema } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { NotificationSettingsService } from './notification-settings.service';

function makeService(overrides: {
  findMany?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const update = overrides.update ?? vi.fn().mockResolvedValue({});
  const prisma = { notificationChannelSetting: { findMany, update } };
  const service = new NotificationSettingsService(
    prisma as unknown as ConstructorParameters<
      typeof NotificationSettingsService
    >[0],
  );
  return { service, findMany, update };
}

function knownError(code: string) {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, { code, message: code });
}

describe('NotificationSettingsService', () => {
  it('list orders by channel', async () => {
    const { service, findMany } = makeService({});

    await service.list();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { channel: 'asc' } });
  });

  it('update persists enabled + recipientUserIds keyed by channel', async () => {
    const update = vi.fn().mockResolvedValue({
      channel: 'EMAIL',
      enabled: true,
      recipientUserIds: ['u1', 'u2'],
    });
    const { service } = makeService({ update });

    const result = await service.update('EMAIL', {
      enabled: true,
      recipientUserIds: ['u1', 'u2'],
    });

    expect(update).toHaveBeenCalledWith({
      where: { channel: 'EMAIL' },
      data: { enabled: true, recipientUserIds: ['u1', 'u2'] },
    });
    expect(result).toMatchObject({ channel: 'EMAIL', enabled: true });
  });

  it('update throws NotFoundException for an unknown channel (P2025)', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2025'));
    const { service } = makeService({ update });

    await expect(
      service.update('SMS', { enabled: true, recipientUserIds: [] }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('updateNotificationChannelSettingSchema (Story 14.4)', () => {
  const uuid = '123e4567-e89b-42d3-a456-426614174000';

  it('accepts a valid body', () => {
    const parsed = updateNotificationChannelSettingSchema.safeParse({
      enabled: true,
      recipientUserIds: [uuid],
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts an enabled toggle with an empty recipient list', () => {
    expect(
      updateNotificationChannelSettingSchema.safeParse({
        enabled: false,
        recipientUserIds: [],
      }).success,
    ).toBe(true);
  });

  it('rejects a non-uuid recipient id', () => {
    expect(
      updateNotificationChannelSettingSchema.safeParse({
        enabled: true,
        recipientUserIds: ['not-a-uuid'],
      }).success,
    ).toBe(false);
  });

  it('rejects a missing enabled flag', () => {
    expect(
      updateNotificationChannelSettingSchema.safeParse({
        recipientUserIds: [uuid],
      }).success,
    ).toBe(false);
  });
});
