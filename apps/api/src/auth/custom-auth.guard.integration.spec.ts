import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CustomAuthGuard } from './custom-auth.guard';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { PrismaService } from '../prisma/prisma.service';

// The guard's own unit spec exercises its logic against a MOCKED
// ExecutionContext — it never proves the guard is actually wired as a global
// APP_GUARD, nor that a real tokenless HTTP request to a normal route is
// rejected while a @Public() route stays open. This boots a real
// INestApplication with the guard registered exactly as app.module.ts does,
// using a real JwtService (so tokens are genuinely signed/verified, not
// mocked) and drives it over HTTP via supertest.

@Controller('protected-probe')
class ProtectedProbeController {
  @Get()
  read(@CurrentUser() user: AuthUser) {
    return { id: user.id, role: user.role };
  }
}

@Controller('public-probe')
class PublicProbeController {
  @Public()
  @Get()
  read() {
    return { ok: true };
  }
}

describe('CustomAuthGuard wired globally (APP_GUARD) over real HTTP', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  async function boot(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { user: { findUnique } };
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [ProtectedProbeController, PublicProbeController],
      providers: [
        Reflector,
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: CustomAuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    jwtService = moduleRef.get(JwtService);
    await app.init();
  }

  afterEach(async () => {
    if (app) await app.close();
  });

  it('401s a tokenless request to a normal (non-@Public) route', async () => {
    await boot(vi.fn());
    const res = await request(app.getHttpServer()).get('/protected-probe');
    expect(res.status).toBe(401);
  });

  it('401s a request whose bearer token fails verification', async () => {
    await boot(vi.fn());
    const res = await request(app.getHttpServer())
      .get('/protected-probe')
      .set('Authorization', 'Bearer not-a-real-jwt');
    expect(res.status).toBe(401);
  });

  it('allows a valid token through and threads the resolved user into the handler', async () => {
    await boot(
      vi.fn().mockResolvedValue({ id: 'user-1', role: 'OWNER_ADMIN' }),
    );
    const token = await jwtService.signAsync({ sub: 'user-1' });
    const res = await request(app.getHttpServer())
      .get('/protected-probe')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'user-1', role: 'OWNER_ADMIN' });
  });

  it('401s a valid token whose subject no longer resolves to a User', async () => {
    await boot(vi.fn().mockResolvedValue(null));
    const token = await jwtService.signAsync({ sub: 'gone' });
    const res = await request(app.getHttpServer())
      .get('/protected-probe')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  it('leaves a @Public() route reachable with no token (health / login / cron path)', async () => {
    await boot(vi.fn());
    const res = await request(app.getHttpServer()).get('/public-probe');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
