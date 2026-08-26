import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

// HTTP-level route-ordering regression coverage. `GET /expenses/summary`
// resolves correctly ONLY because its handler is declared before
// `@Get(':id')` — Nest matches routes in declaration order. If someone
// reorders the decorators so `:id` wins, `/expenses/summary` silently
// resolves to `findOne('summary')` (404, the Expenses page's stat-tile
// fetch crashes). Neither expenses.controller.spec.ts (calls controller
// methods directly) nor the web page.test.tsx (mocks fetch by URL
// substring) would catch that — both stay green. These cases build a real
// INestApplication and drive it over HTTP via supertest, the same harness
// as rmc.controller.integration.spec.ts, precisely to close that gap.
describe('ExpensesController route ordering (static paths must win over :id)', () => {
  let app: INestApplication;

  function makeService() {
    return {
      create: vi.fn().mockResolvedValue({ id: 'e1' }),
      list: vi.fn().mockResolvedValue([]),
      summary: vi.fn().mockResolvedValue({
        totalThisMonth: 0,
        totalThisWeek: 0,
        largestCategoryThisMonth: null,
      }),
      findOne: vi.fn().mockResolvedValue({ id: 'e1' }),
    };
  }

  async function bootstrap(service: ReturnType<typeof makeService>) {
    const moduleRef = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('GET /expenses/summary reaches ExpensesService.summary, never findOne', async () => {
    const service = makeService();
    await bootstrap(service);

    const res = await request(app.getHttpServer()).get('/expenses/summary');

    expect(res.status).toBe(200);
    expect(service.summary).toHaveBeenCalled();
    expect(service.findOne).not.toHaveBeenCalled();
  });

  it('GET /expenses/:id with a genuine id still reaches findOne (wildcard intact)', async () => {
    const service = makeService();
    await bootstrap(service);

    const res = await request(app.getHttpServer()).get(
      '/expenses/11111111-1111-4111-8111-111111111111',
    );

    expect(res.status).toBe(200);
    expect(service.findOne).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
    );
    expect(service.summary).not.toHaveBeenCalled();
  });
});
