import { UnauthorizedException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsController } from './reports.controller';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { LabourReportsService } from './labour-reports.service';
import { MachineryVehicleReportsService } from './machinery-reports.service';

function makeController() {
  const compiler = {
    currentDsrsForDate: vi.fn().mockResolvedValue([]),
    compile: vi.fn(),
  };
  const delivery = {
    ensureDeliveries: vi.fn(),
    retryPending: vi.fn().mockResolvedValue({ retried: 0 }),
  };
  const reports = { listDaily: vi.fn(), findDaily: vi.fn() };
  const siteInventoryReports = {
    getSiteReport: vi.fn(),
    getInventoryReport: vi.fn(),
  };
  const labourReports = { getLabourReport: vi.fn() };
  const machineryReports = { getMachineryReport: vi.fn() };
  const controller = new ReportsController(
    compiler as unknown as ReportCompilerService,
    delivery as unknown as ReportDeliveryService,
    reports as unknown as ReportsService,
    siteInventoryReports as unknown as SiteInventoryReportsService,
    labourReports as unknown as LabourReportsService,
    machineryReports as unknown as MachineryVehicleReportsService,
  );
  return {
    controller,
    compiler,
    delivery,
    siteInventoryReports,
    labourReports,
    machineryReports,
  };
}

const originalSecret = process.env.CRON_SECRET;

afterEach(() => {
  process.env.CRON_SECRET = originalSecret;
  vi.restoreAllMocks();
});

describe('ReportsController Cron auth (endpoint must not be publicly callable)', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('rejects a request with no Authorization header', async () => {
    const { controller, compiler } = makeController();
    await expect(
      controller.compileDailyReports(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compiler.currentDsrsForDate).not.toHaveBeenCalled();
  });

  it('rejects a request with the wrong bearer token', async () => {
    const { controller, compiler } = makeController();
    await expect(
      controller.compileDailyReports('Bearer wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compiler.currentDsrsForDate).not.toHaveBeenCalled();
  });

  it('accepts a request with the correct bearer token', async () => {
    const { controller, compiler } = makeController();
    const result = await controller.compileDailyReports('Bearer test-secret');
    expect(compiler.currentDsrsForDate).toHaveBeenCalledTimes(1);
    expect(result.compiled).toBe(0);
  });

  it('fails closed when CRON_SECRET is unset — even a bearer header is rejected', async () => {
    delete process.env.CRON_SECRET;
    const { controller, compiler } = makeController();
    await expect(
      controller.compileDailyReports('Bearer test-secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(compiler.currentDsrsForDate).not.toHaveBeenCalled();
  });

  it('protects the retry-sweep endpoint too', async () => {
    const { controller, delivery } = makeController();
    await expect(
      controller.retryReportDeliveries('Bearer wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(delivery.retryPending).not.toHaveBeenCalled();

    await controller.retryReportDeliveries('Bearer test-secret');
    expect(delivery.retryPending).toHaveBeenCalledTimes(1);
  });
});

describe('ReportsController compile handler', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  it('compiles + delivers each Site with a DSR and skips the rest (AC #4)', async () => {
    const { controller, compiler, delivery } = makeController();
    compiler.currentDsrsForDate.mockResolvedValue([
      { id: 'dsr1', siteId: 'site1' },
      { id: 'dsr2', siteId: 'site2' },
    ]);
    compiler.compile
      .mockResolvedValueOnce({ id: 'report1' })
      .mockResolvedValueOnce({ id: 'report2' });

    const result = await controller.compileDailyReports(
      'Bearer test-secret',
      '2026-08-11',
    );

    expect(compiler.compile).toHaveBeenCalledTimes(2);
    expect(delivery.ensureDeliveries).toHaveBeenCalledWith('report1');
    expect(delivery.ensureDeliveries).toHaveBeenCalledWith('report2');
    expect(result).toEqual({
      reportDate: '2026-08-11',
      sitesWithDsr: 2,
      compiled: 2,
      failedSiteIds: [],
    });
  });

  it("one Site's failure is recorded and the loop continues to the rest", async () => {
    const { controller, compiler, delivery } = makeController();
    compiler.currentDsrsForDate.mockResolvedValue([
      { id: 'dsr1', siteId: 'site1' },
      { id: 'dsr2', siteId: 'site2' },
      { id: 'dsr3', siteId: 'site3' },
    ]);
    compiler.compile
      .mockResolvedValueOnce({ id: 'report1' })
      .mockRejectedValueOnce(new Error('DB blew up on site2'))
      .mockResolvedValueOnce({ id: 'report3' });

    const result = await controller.compileDailyReports(
      'Bearer test-secret',
      '2026-08-11',
    );

    // site2 failed, but site1 and site3 still compiled + delivered.
    expect(delivery.ensureDeliveries).toHaveBeenCalledWith('report1');
    expect(delivery.ensureDeliveries).toHaveBeenCalledWith('report3');
    expect(result).toEqual({
      reportDate: '2026-08-11',
      sitesWithDsr: 3,
      compiled: 2,
      failedSiteIds: ['site2'],
    });
  });
});

// Story 13.2 (FR-42/FR-43): the read endpoints are unauthenticated report
// views (no CRON_SECRET gate) — they just thread their query params into the
// composition service.
describe('ReportsController Site & Inventory report views', () => {
  it('threads siteId/from/to into getSiteReport', async () => {
    const { controller, siteInventoryReports } = makeController();

    await controller.siteReport('site1', '2026-08-01', '2026-08-31');

    expect(siteInventoryReports.getSiteReport).toHaveBeenCalledWith({
      siteId: 'site1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('threads siteId/materialId/from/to into getInventoryReport', async () => {
    const { controller, siteInventoryReports } = makeController();

    await controller.inventoryReport(
      'site1',
      'mat1',
      '2026-08-01',
      '2026-08-31',
    );

    expect(siteInventoryReports.getInventoryReport).toHaveBeenCalledWith({
      siteId: 'site1',
      materialId: 'mat1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('passes undefined filters straight through when no query is given', async () => {
    const { controller, siteInventoryReports } = makeController();

    await controller.siteReport();
    await controller.inventoryReport();

    expect(siteInventoryReports.getSiteReport).toHaveBeenCalledWith({
      siteId: undefined,
      from: undefined,
      to: undefined,
    });
    expect(siteInventoryReports.getInventoryReport).toHaveBeenCalledWith({
      siteId: undefined,
      materialId: undefined,
      from: undefined,
      to: undefined,
    });
  });
});

// Story 13.3 (FR-44/FR-45): the Labour and Machinery/Vehicle report views —
// same unauthenticated, thread-the-query-params-through discipline.
describe('ReportsController Labour & Machinery/Vehicle report views', () => {
  it('threads teamMemberId/from/to into getLabourReport', async () => {
    const { controller, labourReports } = makeController();

    await controller.labourReport('tm1', '2026-08-01', '2026-08-31');

    expect(labourReports.getLabourReport).toHaveBeenCalledWith({
      teamMemberId: 'tm1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('passes undefined labour filters straight through when no query is given', async () => {
    const { controller, labourReports } = makeController();

    await controller.labourReport();

    expect(labourReports.getLabourReport).toHaveBeenCalledWith({
      teamMemberId: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it('validates assetType to MACHINERY|VEHICLE and threads it into getMachineryReport', async () => {
    const { controller, machineryReports } = makeController();

    await controller.machineryReport(
      'MACHINERY',
      'm1',
      '2026-08-01',
      '2026-08-31',
    );

    expect(machineryReports.getMachineryReport).toHaveBeenCalledWith({
      assetType: 'MACHINERY',
      assetId: 'm1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('treats a malformed assetType as no asset selected (register-only view), not a 400', async () => {
    const { controller, machineryReports } = makeController();

    await controller.machineryReport('NONSENSE', 'm1');

    expect(machineryReports.getMachineryReport).toHaveBeenCalledWith({
      assetType: undefined,
      assetId: 'm1',
      from: undefined,
      to: undefined,
    });
  });

  it('passes undefined asset filters straight through when no query is given', async () => {
    const { controller, machineryReports } = makeController();

    await controller.machineryReport();

    expect(machineryReports.getMachineryReport).toHaveBeenCalledWith({
      assetType: undefined,
      assetId: undefined,
      from: undefined,
      to: undefined,
    });
  });
});
