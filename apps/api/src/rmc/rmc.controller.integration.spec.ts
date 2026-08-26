import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RmcController } from './rmc.controller';
import { RmcService } from './rmc.service';

// HTTP-level route-ordering regression coverage. `GET /rmc-entries/report`
// and `GET /rmc-entries/stats/this-month` resolve correctly ONLY because
// their handlers are declared before `@Get(':id')` — Nest matches routes in
// declaration order. If someone reorders the decorators so `:id` wins,
// `/rmc-entries/report` silently resolves to `findOne('report')` (404, RMC
// page crashes) and `/rmc-entries/stats/this-month` to `findOne('stats')`.
// Neither rmc.controller.spec.ts (calls controller methods directly) nor the
// web page.test.tsx (mocks fetch by URL substring) would catch that — both
// stay green. These cases build a real INestApplication and drive it over
// HTTP via supertest, the same harness as
// patch-body-validation.integration.spec.ts, precisely to close that gap.
describe('RmcController route ordering (static paths must win over :id)', () => {
  let app: INestApplication;

  function makeService() {
    return {
      report: vi.fn().mockResolvedValue([]),
      statsThisMonth: vi.fn().mockResolvedValue({
        totalQuantityM3: 0,
        totalCost: 0,
        activeVendorCount: 0,
      }),
      findOne: vi.fn().mockResolvedValue({ id: 'r1' }),
    };
  }

  async function bootstrap(service: ReturnType<typeof makeService>) {
    const moduleRef = await Test.createTestingModule({
      controllers: [RmcController],
      providers: [{ provide: RmcService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('GET /rmc-entries/report reaches RmcService.report, never findOne', async () => {
    const service = makeService();
    await bootstrap(service);

    const res = await request(app.getHttpServer()).get(
      '/rmc-entries/report?groupBy=site',
    );

    expect(res.status).toBe(200);
    expect(service.report).toHaveBeenCalledWith('site', {
      from: undefined,
      to: undefined,
    });
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('GET /rmc-entries/stats/this-month reaches RmcService.statsThisMonth, never findOne', async () => {
    const service = makeService();
    await bootstrap(service);

    const res = await request(app.getHttpServer()).get(
      '/rmc-entries/stats/this-month',
    );

    expect(res.status).toBe(200);
    expect(service.statsThisMonth).toHaveBeenCalled();
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('GET /rmc-entries/:id with a genuine id still reaches findOne (wildcard intact)', async () => {
    const service = makeService();
    await bootstrap(service);

    const res = await request(app.getHttpServer()).get(
      '/rmc-entries/11111111-1111-4111-8111-111111111111',
    );

    expect(res.status).toBe(200);
    expect(service.findOne).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(service.report).not.toHaveBeenCalled();
    expect(service.statsThisMonth).not.toHaveBeenCalled();
  });
});
