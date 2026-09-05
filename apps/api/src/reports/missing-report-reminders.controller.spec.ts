import { UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MissingReportRemindersController } from './missing-report-reminders.controller';
import { MissingReportRemindersService } from './missing-report-reminders.service';

function makeController() {
  const service = {
    send: vi.fn().mockResolvedValue({ missingCount: 0 }),
  };
  const controller = new MissingReportRemindersController(
    service as unknown as MissingReportRemindersService,
  );
  return { controller, service };
}

const originalSecret = process.env.CRON_SECRET;

afterEach(() => {
  process.env.CRON_SECRET = originalSecret;
  vi.restoreAllMocks();
});

// Same lesson as ReportSchedulesController's cron suite: @Public but
// CRON_SECRET-gated, fail-closed when the secret is unset.
describe('MissingReportRemindersController Cron auth', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('rejects a request with no Authorization header', async () => {
    const { controller, service } = makeController();
    await expect(
      controller.sendMissingReportReminders(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.send).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong bearer token', async () => {
    const { controller, service } = makeController();
    await expect(
      controller.sendMissingReportReminders('Bearer wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.send).not.toHaveBeenCalled();
  });

  it('accepts a request with the correct bearer token', async () => {
    const { controller, service } = makeController();
    await controller.sendMissingReportReminders('Bearer test-secret');
    expect(service.send).toHaveBeenCalledTimes(1);
  });

  it('fails closed when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    const { controller, service } = makeController();
    await expect(
      controller.sendMissingReportReminders('Bearer test-secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.send).not.toHaveBeenCalled();
  });
});
