import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  createReportScheduleSchema,
  updateReportScheduleSchema,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { ReportSchedulesService } from './report-schedules.service';

type ScheduleSeed = {
  id: string;
  reportType: string;
  frequency: string;
  recipientUserIds: string[];
  enabled: boolean;
  siteId: string | null;
  lastRunAt: Date | null;
};

function makeHarness(schedules: ScheduleSeed[] = []) {
  const scheduleUpdate = vi.fn().mockResolvedValue({});
  const scheduleFindMany = vi.fn().mockResolvedValue(schedules);
  const scheduleCreate = vi.fn().mockResolvedValue({ id: 'new' });

  // Story 14.5 independence: these must NEVER be touched by the schedule runner
  // (they belong to Story 14.4 / Story 13.1's daily-DSR path).
  const notificationFindMany = vi.fn();
  const notificationFindUnique = vi.fn();
  const dailyReportFindMany = vi.fn();
  const dailyReportCreate = vi.fn();

  const prisma = {
    reportSchedule: {
      findMany: scheduleFindMany,
      update: scheduleUpdate,
      create: scheduleCreate,
    },
    notificationChannelSetting: {
      findMany: notificationFindMany,
      findUnique: notificationFindUnique,
    },
    dailyReport: { findMany: dailyReportFindMany, create: dailyReportCreate },
  };

  const siteInventoryReports = {
    getSiteReport: vi.fn().mockResolvedValue({ kind: 'site' }),
    getInventoryReport: vi.fn().mockResolvedValue({ kind: 'inventory' }),
  };
  const labourReports = {
    getLabourReport: vi.fn().mockResolvedValue({ kind: 'labour' }),
  };
  const machineryReports = {
    getMachineryReport: vi.fn().mockResolvedValue({ kind: 'machinery' }),
  };
  const financialReports = {
    getFinancialReport: vi.fn().mockResolvedValue({ kind: 'financial' }),
  };
  const delivery = {
    deliverScheduledReport: vi.fn().mockResolvedValue({ recipients: 1 }),
  };

  const service = new ReportSchedulesService(
    prisma as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[0],
    siteInventoryReports as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[1],
    labourReports as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[2],
    machineryReports as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[3],
    financialReports as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[4],
    delivery as unknown as ConstructorParameters<
      typeof ReportSchedulesService
    >[5],
  );

  return {
    service,
    prisma,
    scheduleUpdate,
    siteInventoryReports,
    labourReports,
    machineryReports,
    financialReports,
    delivery,
    notificationFindMany,
    notificationFindUnique,
    dailyReportFindMany,
    dailyReportCreate,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-08-26T12:00:00.000Z');

describe('ReportSchedulesService.isDue (Story 14.5 due-detection)', () => {
  const { service } = makeHarness();

  it('is due immediately when lastRunAt is null', () => {
    expect(service.isDue({ frequency: 'DAILY', lastRunAt: null }, NOW)).toBe(
      true,
    );
    expect(service.isDue({ frequency: 'WEEKLY', lastRunAt: null }, NOW)).toBe(
      true,
    );
    expect(service.isDue({ frequency: 'MONTHLY', lastRunAt: null }, NOW)).toBe(
      true,
    );
  });

  it('DAILY: due only once a full day has elapsed', () => {
    expect(
      service.isDue(
        {
          frequency: 'DAILY',
          lastRunAt: new Date(NOW.getTime() - 12 * 60 * 60 * 1000),
        },
        NOW,
      ),
    ).toBe(false);
    expect(
      service.isDue(
        {
          frequency: 'DAILY',
          lastRunAt: new Date(NOW.getTime() - 25 * 60 * 60 * 1000),
        },
        NOW,
      ),
    ).toBe(true);
  });

  it('WEEKLY: due only once seven days have elapsed', () => {
    expect(
      service.isDue(
        {
          frequency: 'WEEKLY',
          lastRunAt: new Date(NOW.getTime() - 6 * DAY_MS),
        },
        NOW,
      ),
    ).toBe(false);
    expect(
      service.isDue(
        {
          frequency: 'WEEKLY',
          lastRunAt: new Date(NOW.getTime() - 8 * DAY_MS),
        },
        NOW,
      ),
    ).toBe(true);
  });

  it('MONTHLY: due only once ~30 days have elapsed', () => {
    expect(
      service.isDue(
        {
          frequency: 'MONTHLY',
          lastRunAt: new Date(NOW.getTime() - 20 * DAY_MS),
        },
        NOW,
      ),
    ).toBe(false);
    expect(
      service.isDue(
        {
          frequency: 'MONTHLY',
          lastRunAt: new Date(NOW.getTime() - 31 * DAY_MS),
        },
        NOW,
      ),
    ).toBe(true);
  });
});

describe('ReportSchedulesService.runDueSchedules (Story 14.5)', () => {
  function schedule(overrides: Partial<ScheduleSeed>): ScheduleSeed {
    return {
      id: 's1',
      reportType: 'INVENTORY',
      frequency: 'WEEKLY',
      recipientUserIds: ['u1', 'u2'],
      enabled: true,
      siteId: null,
      lastRunAt: null,
      ...overrides,
    };
  }

  it('calls the correct Epic 13 report endpoint per reportType and delivers to the schedule recipients', async () => {
    const harness = makeHarness([
      schedule({
        id: 'site',
        reportType: 'SITE',
        siteId: 'site-1',
        recipientUserIds: ['a'],
      }),
      schedule({ id: 'inv', reportType: 'INVENTORY', recipientUserIds: ['b'] }),
      schedule({ id: 'lab', reportType: 'LABOUR', recipientUserIds: ['c'] }),
      schedule({
        id: 'mv',
        reportType: 'MACHINERY_VEHICLE',
        recipientUserIds: ['d'],
      }),
      schedule({
        id: 'fin',
        reportType: 'FINANCIAL',
        siteId: 'site-2',
        recipientUserIds: ['e'],
      }),
    ]);

    const result = await harness.service.runDueSchedules(NOW);

    expect(harness.siteInventoryReports.getSiteReport).toHaveBeenCalledWith(
      expect.objectContaining({ siteId: 'site-1' }),
    );
    expect(
      harness.siteInventoryReports.getInventoryReport,
    ).toHaveBeenCalledWith(expect.objectContaining({ siteId: undefined }));
    expect(harness.labourReports.getLabourReport).toHaveBeenCalledTimes(1);
    expect(harness.machineryReports.getMachineryReport).toHaveBeenCalledTimes(
      1,
    );
    expect(harness.financialReports.getFinancialReport).toHaveBeenCalledWith(
      expect.objectContaining({ siteId: 'site-2' }),
    );

    // Delivered via ReportDeliveryService to each schedule's own recipient list.
    expect(harness.delivery.deliverScheduledReport).toHaveBeenCalledWith(
      ['a'],
      expect.objectContaining({ siteName: expect.stringContaining('SITE') }),
    );
    expect(harness.delivery.deliverScheduledReport).toHaveBeenCalledWith(
      ['e'],
      expect.any(Object),
    );
    expect(result.delivered).toBe(5);
    expect(result.failedScheduleIds).toEqual([]);
  });

  it('updates lastRunAt on success', async () => {
    const harness = makeHarness([schedule({ id: 's1' })]);

    await harness.service.runDueSchedules(NOW);

    expect(harness.scheduleUpdate).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { lastRunAt: NOW },
    });
  });

  it('skips schedules that are not yet due (no fetch, no deliver, no lastRunAt update)', async () => {
    const harness = makeHarness([
      schedule({
        id: 's1',
        frequency: 'WEEKLY',
        lastRunAt: new Date(NOW.getTime() - DAY_MS),
      }),
    ]);

    const result = await harness.service.runDueSchedules(NOW);

    expect(
      harness.siteInventoryReports.getInventoryReport,
    ).not.toHaveBeenCalled();
    expect(harness.delivery.deliverScheduledReport).not.toHaveBeenCalled();
    expect(harness.scheduleUpdate).not.toHaveBeenCalled();
    expect(result.delivered).toBe(0);
  });

  it('is independent of FR-50: never touches NotificationChannelSetting or the daily-DSR DailyReport path (AC #1)', async () => {
    const harness = makeHarness([
      schedule({ id: 's1', reportType: 'FINANCIAL' }),
      schedule({ id: 's2', reportType: 'LABOUR' }),
    ]);

    await harness.service.runDueSchedules(NOW);

    expect(harness.notificationFindMany).not.toHaveBeenCalled();
    expect(harness.notificationFindUnique).not.toHaveBeenCalled();
    expect(harness.dailyReportFindMany).not.toHaveBeenCalled();
    expect(harness.dailyReportCreate).not.toHaveBeenCalled();
  });

  it('one schedule failing does not abort the run — it is recorded and the rest proceed', async () => {
    const harness = makeHarness([
      schedule({ id: 'bad', reportType: 'INVENTORY' }),
      schedule({ id: 'good', reportType: 'LABOUR' }),
    ]);
    harness.siteInventoryReports.getInventoryReport.mockRejectedValueOnce(
      new Error('query failed'),
    );

    const result = await harness.service.runDueSchedules(NOW);

    expect(result.failedScheduleIds).toEqual(['bad']);
    expect(result.delivered).toBe(1);
    expect(harness.labourReports.getLabourReport).toHaveBeenCalledTimes(1);
  });
});

describe('ReportSchedulesService.update (Story 14.5)', () => {
  it('translates a P2025 into NotFoundException', async () => {
    const harness = makeHarness();
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2025', message: 'not found' });
    harness.prisma.reportSchedule.update = vi.fn().mockRejectedValue(error);

    await expect(
      harness.service.update('missing', { enabled: false }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('report-schedule Zod schemas (Story 14.5)', () => {
  const uuid = '123e4567-e89b-42d3-a456-426614174000';

  it('createReportScheduleSchema applies defaults (enabled true, empty recipients)', () => {
    const parsed = createReportScheduleSchema.parse({
      reportType: 'INVENTORY',
      frequency: 'WEEKLY',
    });
    expect(parsed).toEqual({
      reportType: 'INVENTORY',
      frequency: 'WEEKLY',
      recipientUserIds: [],
      enabled: true,
    });
  });

  it('createReportScheduleSchema accepts a Site-scoped schedule with recipients', () => {
    const parsed = createReportScheduleSchema.safeParse({
      reportType: 'FINANCIAL',
      frequency: 'MONTHLY',
      recipientUserIds: [uuid],
      siteId: uuid,
      enabled: false,
    });
    expect(parsed.success).toBe(true);
  });

  it('createReportScheduleSchema rejects an unknown report type / frequency', () => {
    expect(
      createReportScheduleSchema.safeParse({
        reportType: 'PAYROLL',
        frequency: 'WEEKLY',
      }).success,
    ).toBe(false);
    expect(
      createReportScheduleSchema.safeParse({
        reportType: 'SITE',
        frequency: 'HOURLY',
      }).success,
    ).toBe(false);
  });

  it('createReportScheduleSchema rejects a non-uuid siteId', () => {
    expect(
      createReportScheduleSchema.safeParse({
        reportType: 'SITE',
        frequency: 'DAILY',
        siteId: 'not-a-uuid',
      }).success,
    ).toBe(false);
  });

  it('updateReportScheduleSchema.parse({}) is a true no-op — does not silently re-enable a paused schedule', () => {
    expect(updateReportScheduleSchema.parse({})).toEqual({});
  });

  it('updateReportScheduleSchema accepts a pause-only edit', () => {
    expect(updateReportScheduleSchema.parse({ enabled: false })).toEqual({
      enabled: false,
    });
  });
});
