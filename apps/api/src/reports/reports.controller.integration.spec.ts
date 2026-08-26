import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsController } from './reports.controller';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { LabourReportsService } from './labour-reports.service';
import { MachineryVehicleReportsService } from './machinery-reports.service';
import { FinancialReportsService } from './financial-reports.service';

// HTTP-level route-ordering regression coverage (same harness as
// rmc.controller.integration.spec.ts). `GET /reports/daily` resolves to
// ReportsService.listDaily ONLY because its handler is declared before
// `@Get('reports/daily/:id')` — Nest matches routes in declaration order. If
// someone reorders them, `/reports/daily` silently resolves to
// findDaily('daily'). And `POST /cron/compile-daily-reports` must reach the
// Cron handler (behind CRON_SECRET), never any read handler. Unit specs that
// call controller methods directly do NOT catch route-ordering regressions.
describe('ReportsController route ordering + Cron path', () => {
  let app: INestApplication;
  const originalSecret = process.env.CRON_SECRET;

  function makeServices() {
    return {
      compiler: {
        currentDsrsForDate: vi.fn().mockResolvedValue([]),
        compile: vi.fn(),
      },
      delivery: {
        ensureDeliveries: vi.fn(),
        retryPending: vi.fn().mockResolvedValue({ retried: 0 }),
      },
      reports: {
        listDaily: vi.fn().mockResolvedValue([{ id: 'report1' }]),
        findDaily: vi.fn().mockResolvedValue({ id: 'report1' }),
      },
      siteInventoryReports: {
        getSiteReport: vi.fn().mockResolvedValue({
          site: null,
          dsrs: [],
          photos: [],
          feed: [],
        }),
        getInventoryReport: vi.fn().mockResolvedValue({
          godownStock: [],
          siteStock: [],
          lowStock: [],
          purchases: [],
          movements: [],
          consumptions: [],
          returnWastages: [],
        }),
      },
      labourReports: {
        getLabourReport: vi.fn().mockResolvedValue({
          summary: {},
          outstanding: { total: 0, byTeamMember: [] },
          workRecords: [],
          payments: [],
          advances: [],
          adjustments: [],
        }),
      },
      machineryReports: {
        getMachineryReport: vi.fn().mockResolvedValue({
          machinery: [],
          vehicles: [],
          asset: null,
          movements: [],
          serviceLogs: [],
        }),
      },
      financialReports: {
        getFinancialReport: vi.fn().mockResolvedValue({
          bySite: [],
          contractorTotal: {
            material: 0,
            labour: 0,
            rmc: 0,
            machineryVehicle: 0,
            expenses: 0,
            total: 0,
          },
        }),
      },
    };
  }

  async function bootstrap(services: ReturnType<typeof makeServices>) {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportCompilerService, useValue: services.compiler },
        { provide: ReportDeliveryService, useValue: services.delivery },
        { provide: ReportsService, useValue: services.reports },
        {
          provide: SiteInventoryReportsService,
          useValue: services.siteInventoryReports,
        },
        {
          provide: LabourReportsService,
          useValue: services.labourReports,
        },
        {
          provide: MachineryVehicleReportsService,
          useValue: services.machineryReports,
        },
        {
          provide: FinancialReportsService,
          useValue: services.financialReports,
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-secret';
  });

  afterEach(async () => {
    process.env.CRON_SECRET = originalSecret;
    if (app) await app.close();
  });

  it('GET /reports/daily reaches listDaily, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer()).get('/reports/daily');

    expect(res.status).toBe(200);
    expect(services.reports.listDaily).toHaveBeenCalled();
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });

  it('GET /reports/daily/:id with a genuine id reaches findDaily (wildcard intact)', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer()).get(
      '/reports/daily/11111111-1111-4111-8111-111111111111',
    );

    expect(res.status).toBe(200);
    expect(services.reports.findDaily).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(services.reports.listDaily).not.toHaveBeenCalled();
  });

  it('POST /cron/compile-daily-reports with the Cron secret reaches the compile handler', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .post('/cron/compile-daily-reports')
      .set('Authorization', 'Bearer test-secret');

    expect(res.status).toBe(201);
    expect(services.compiler.currentDsrsForDate).toHaveBeenCalled();
  });

  it('POST /cron/compile-daily-reports without the Cron secret is rejected 401', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer()).post(
      '/cron/compile-daily-reports',
    );

    expect(res.status).toBe(401);
    expect(services.compiler.currentDsrsForDate).not.toHaveBeenCalled();
  });

  // Story 13.2: `/reports/sites` and `/reports/inventory` are new sibling
  // paths. `/reports/daily/:id`'s wildcard requires the literal `daily`
  // segment, so it can never swallow these — this asserts that at the HTTP
  // layer (a unit call on the controller method would not).
  it('GET /reports/sites reaches getSiteReport, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .get('/reports/sites')
      .query({ siteId: 'site1', from: '2026-08-01', to: '2026-08-31' });

    expect(res.status).toBe(200);
    expect(services.siteInventoryReports.getSiteReport).toHaveBeenCalledWith({
      siteId: 'site1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });

  it('GET /reports/inventory reaches getInventoryReport, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .get('/reports/inventory')
      .query({ siteId: 'site1', materialId: 'mat1' });

    expect(res.status).toBe(200);
    expect(
      services.siteInventoryReports.getInventoryReport,
    ).toHaveBeenCalledWith({
      siteId: 'site1',
      materialId: 'mat1',
      from: undefined,
      to: undefined,
    });
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });

  // Story 13.3: `/reports/labour` and `/reports/machinery-vehicles` are new
  // sibling paths — same reasoning as `/reports/sites` above; the
  // `/reports/daily/:id` wildcard can never swallow them.
  it('GET /reports/labour reaches getLabourReport, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .get('/reports/labour')
      .query({ teamMemberId: 'tm1', from: '2026-08-01', to: '2026-08-31' });

    expect(res.status).toBe(200);
    expect(services.labourReports.getLabourReport).toHaveBeenCalledWith({
      teamMemberId: 'tm1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });

  it('GET /reports/machinery-vehicles reaches getMachineryReport, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .get('/reports/machinery-vehicles')
      .query({ assetType: 'MACHINERY', assetId: 'm1' });

    expect(res.status).toBe(200);
    expect(services.machineryReports.getMachineryReport).toHaveBeenCalledWith({
      assetType: 'MACHINERY',
      assetId: 'm1',
      from: undefined,
      to: undefined,
    });
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });

  // Story 13.4: `/reports/financial` is a new sibling path — same reasoning as
  // `/reports/sites` above; the `/reports/daily/:id` wildcard requires the
  // literal `daily` segment, so it can never swallow this route.
  it('GET /reports/financial reaches getFinancialReport, never findDaily', async () => {
    const services = makeServices();
    await bootstrap(services);

    const res = await request(app.getHttpServer())
      .get('/reports/financial')
      .query({ siteId: 'site1', from: '2026-08-01', to: '2026-08-31' });

    expect(res.status).toBe(200);
    expect(services.financialReports.getFinancialReport).toHaveBeenCalledWith({
      siteId: 'site1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(services.reports.findDaily).not.toHaveBeenCalled();
  });
});
