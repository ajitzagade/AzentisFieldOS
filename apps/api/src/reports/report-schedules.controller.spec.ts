import { UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportSchedulesController } from './report-schedules.controller';
import { ReportSchedulesService } from './report-schedules.service';

function makeController() {
  const service = {
    create: vi.fn().mockResolvedValue({ id: 's1' }),
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({ id: 's1' }),
    runDueSchedules: vi
      .fn()
      .mockResolvedValue({ evaluated: 0, delivered: 0, failedScheduleIds: [] }),
  };
  const controller = new ReportSchedulesController(
    service as unknown as ReportSchedulesService,
  );
  return { controller, service };
}

const originalSecret = process.env.CRON_SECRET;

afterEach(() => {
  process.env.CRON_SECRET = originalSecret;
  vi.restoreAllMocks();
});

describe('ReportSchedulesController CRUD delegation', () => {
  it('create delegates to the service', async () => {
    const { controller, service } = makeController();
    const body = {
      reportType: 'INVENTORY' as const,
      frequency: 'WEEKLY' as const,
      recipientUserIds: [],
      enabled: true,
    };
    await controller.create(body);
    expect(service.create).toHaveBeenCalledWith(body);
  });

  it('list delegates to the service', async () => {
    const { controller, service } = makeController();
    await controller.list();
    expect(service.list).toHaveBeenCalled();
  });

  it('update delegates to the service with the id and body', async () => {
    const { controller, service } = makeController();
    await controller.update('s1', { enabled: false });
    expect(service.update).toHaveBeenCalledWith('s1', { enabled: false });
  });
});

describe('ReportSchedulesController Cron auth (lesson: @Public but CRON_SECRET-gated)', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('rejects a request with no Authorization header', async () => {
    const { controller, service } = makeController();
    await expect(
      controller.runReportSchedules(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.runDueSchedules).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong bearer token', async () => {
    const { controller, service } = makeController();
    await expect(
      controller.runReportSchedules('Bearer wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.runDueSchedules).not.toHaveBeenCalled();
  });

  it('accepts a request with the correct bearer token', async () => {
    const { controller, service } = makeController();
    await controller.runReportSchedules('Bearer test-secret');
    expect(service.runDueSchedules).toHaveBeenCalledTimes(1);
  });

  it('fails closed when CRON_SECRET is unset', async () => {
    delete process.env.CRON_SECRET;
    const { controller, service } = makeController();
    await expect(
      controller.runReportSchedules('Bearer test-secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(service.runDueSchedules).not.toHaveBeenCalled();
  });
});
