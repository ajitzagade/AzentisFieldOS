import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { PrismaService } from '../prisma/prisma.service';

// Code-review follow-up for Story 1.8. The guard's own unit spec exercises its
// logic against a MOCKED ExecutionContext — it never proves the guard is
// actually wired as a global APP_GUARD, nor that a real tokenless HTTP request
// to a normal route is rejected while a @Public() route stays open. This boots
// a real INestApplication with the guard registered exactly as app.module.ts
// does (verifyToken mocked, same style as the other integration specs) and
// drives it over HTTP via supertest — the concrete proof of AC #2/#5 that unit
// specs structurally cannot give.
const verifyTokenMock = vi.hoisted(() => vi.fn());
vi.mock('@clerk/backend', () => ({ verifyToken: verifyTokenMock }));

@Controller('protected-probe')
class ProtectedProbeController {
  @Get()
  read(@CurrentUser() user: AuthUser) {
    // Echoes what the guard attached, so we can assert req.user was threaded.
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

describe('ClerkAuthGuard wired globally (APP_GUARD) over real HTTP', () => {
  let app: INestApplication;

  async function boot(user: {
    findUnique?: ReturnType<typeof vi.fn>;
    count?: ReturnType<typeof vi.fn>;
    create?: ReturnType<typeof vi.fn>;
  }) {
    const prisma = {
      user: {
        findUnique: user.findUnique ?? vi.fn().mockResolvedValue(null),
        count: user.count ?? vi.fn().mockResolvedValue(1),
        create: user.create ?? vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ProtectedProbeController, PublicProbeController],
      providers: [
        Reflector,
        { provide: PrismaService, useValue: prisma },
        { provide: APP_GUARD, useClass: ClerkAuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  }

  afterEach(async () => {
    verifyTokenMock.mockReset();
    if (app) await app.close();
  });

  it('401s a tokenless request to a normal (non-@Public) route', async () => {
    await boot({});
    const res = await request(app.getHttpServer()).get('/protected-probe');
    expect(res.status).toBe(401);
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('401s a request whose bearer token the SDK rejects', async () => {
    verifyTokenMock.mockRejectedValue(new Error('expired'));
    await boot({});
    const res = await request(app.getHttpServer())
      .get('/protected-probe')
      .set('Authorization', 'Bearer expired');
    expect(res.status).toBe(401);
  });

  it('allows a valid token through and threads the resolved user into the handler', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-abc' });
    await boot({
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-abc',
        role: 'OWNER_ADMIN',
      }),
    });
    const res = await request(app.getHttpServer())
      .get('/protected-probe')
      .set('Authorization', 'Bearer good');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'user-1', role: 'OWNER_ADMIN' });
  });

  it('leaves a @Public() route reachable with no token (health / cron path)', async () => {
    await boot({});
    const res = await request(app.getHttpServer()).get('/public-probe');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });
});
