import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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

// Regression test for the double-count bug: AuthController.login() used to
// carry its own `@UseGuards(ThrottlerGuard)` on top of the global APP_GUARD
// registration below, so ThrottlerGuard ran twice per request and every
// real login attempt incremented the shared counter twice — halving the
// documented "5 attempts/minute" limit to ~2-3. This boots the REAL
// AuthController (not a synthetic probe) under the same global-guard wiring
// AppModule uses, so a reintroduced route-level @UseGuards(ThrottlerGuard)
// here would fail this test.
describe('AuthController.login under the real global ThrottlerGuard', () => {
  let app: INestApplication;
  const authService = {
    login: vi.fn().mockResolvedValue({ token: 't', refreshToken: 'r' }),
  };

  async function boot() {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 300 }]),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
    authService.login.mockClear();
  });

  it('allows exactly 5 real login attempts (its own @Throttle override) before 429ing the 6th', async () => {
    await boot();

    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'a@b.com', password: 'wrong' });
      expect(res.status).not.toBe(429);
    }
    expect(authService.login).toHaveBeenCalledTimes(5);

    const sixth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });
    expect(sixth.status).toBe(429);
  });
});

// Regression coverage for main.ts's `app.set('trust proxy', 1)`: without it,
// Express's req.ip (what ThrottlerGuard's default IP-based tracking keys on)
// resolves to the proxy's own address behind Vercel's reverse proxy, so
// every distinct end user would collapse onto one shared rate-limit bucket
// — a burst of legitimate traffic from many users could exhaust the shared
// limit and 429 everyone. No prior test booted with `trust proxy` set or
// simulated more than one client IP.
describe('trust proxy: per-client rate limiting behind a reverse proxy', () => {
  let app: NestExpressApplication;

  async function boot(trustProxy: boolean) {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 2 }]),
      ],
      controllers: [PlainProbeController],
      providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    if (trustProxy) {
      // Mirrors main.ts's app.set('trust proxy', 1) exactly.
      app.set('trust proxy', 1);
    }
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('with trust proxy set, two distinct X-Forwarded-For client IPs get independent rate-limit buckets', async () => {
    await boot(true);

    await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.1');
    await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.1');
    const trippedA = await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.1');
    expect(trippedA.status).toBe(429);

    // A distinct client IP must still have its own untouched limit.
    const clientB = await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.2');
    expect(clientB.status).toBe(200);
  });

  it('without trust proxy set, distinct X-Forwarded-For values are ignored and both clients share one bucket (demonstrates why the setting matters)', async () => {
    await boot(false);

    await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.1');
    await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.1');

    // A "different" client, by X-Forwarded-For alone, is already blocked —
    // proving req.ip ignored the header and both requests were keyed on the
    // same underlying test-client address.
    const clientB = await request(app.getHttpServer())
      .get('/plain-probe')
      .set('X-Forwarded-For', '203.0.113.2');
    expect(clientB.status).toBe(429);
  });
});
