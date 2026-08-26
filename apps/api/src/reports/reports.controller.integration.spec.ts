import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsController } from './reports.controller';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { ReportsService } from './reports.service';

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
    };
  }

  async function bootstrap(services: ReturnType<typeof makeServices>) {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportCompilerService, useValue: services.compiler },
        { provide: ReportDeliveryService, useValue: services.delivery },
        { provide: ReportsService, useValue: services.reports },
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
});
