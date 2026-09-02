import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

// Regression coverage for a real bug found while wiring this up: a
// second, distinctly-named throttler profile (the original `login`
// profile) applies its OWN limit to every route in the app once
// ThrottlerGuard is global — not just the route that names it. Confirmed
// against a real boot (curl against a local server showed /health, which
// has no @Throttle() at all, was already down to 3/5 remaining on the
// `login`-named limiter). The fix collapses everything to one `default`
// profile that AuthController's login route overrides with a stricter
// limit for itself only — this spec boots that exact shape over real HTTP
// and proves a plain route is governed by the generous default, not the
// stricter override some *other* route declares.

@Controller('throttled-probe')
class ThrottledProbeController {
  // Mirrors AuthController.login's shape: a route-level @Throttle()
  // override of the shared `default` profile, much stricter than the
  // global default below.
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  @Get()
  read() {
    return { ok: true };
  }
}

@Controller('plain-probe')
class PlainProbeController {
  // No @Throttle() override at all — every other route in the real app
  // looks like this.
  @Get()
  read() {
    return { ok: true };
  }
}

describe('ThrottlerGuard wired globally (APP_GUARD) over real HTTP', () => {
  let app: INestApplication;

  async function boot() {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 5 }]),
      ],
      controllers: [ThrottledProbeController, PlainProbeController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it("a route with no @Throttle() override is governed by the generous global default, not some other route's stricter override", async () => {
    await boot();

    // The stricter probe's own limit is 2/min — firing 3 requests against
    // the PLAIN route (limit 5/min) must never trip it.
    for (let i = 0; i < 3; i++) {
      const res = await request(app.getHttpServer()).get('/plain-probe');
      expect(res.status).toBe(200);
    }
  });

  it("a route's own @Throttle() override governs only that route, not a sibling route sharing the same underlying profile name", async () => {
    await boot();

    // Trip the stricter probe's override (limit 2/min).
    await request(app.getHttpServer()).get('/throttled-probe');
    await request(app.getHttpServer()).get('/throttled-probe');
    const tripped = await request(app.getHttpServer()).get('/throttled-probe');
    expect(tripped.status).toBe(429);

    // The plain route, sharing the same `default` profile NAME but with no
    // override, must still be unaffected by the other route's own limit
    // having been exhausted.
    const plain = await request(app.getHttpServer()).get('/plain-probe');
    expect(plain.status).toBe(200);
  });

  it('returns 429 with a Retry-After header once a route exhausts its own limit', async () => {
    await boot();

    await request(app.getHttpServer()).get('/throttled-probe');
    await request(app.getHttpServer()).get('/throttled-probe');
    const res = await request(app.getHttpServer()).get('/throttled-probe');

    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
  });
});
