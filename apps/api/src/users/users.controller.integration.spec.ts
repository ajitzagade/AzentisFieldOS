import {
  CanActivate,
  ExecutionContext,
  Injectable,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Role } from '../generated/prisma/client';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { UsersController } from './users.controller';
import { ClerkWebhookController } from './clerk-webhook.controller';
import { UsersService } from './users.service';

// Svix is mocked so the webhook route can be exercised over HTTP without a real
// secret — verify() throws, proving the (static) POST /webhooks/clerk route is
// reachable and rejects an unverified payload with 401 (not shadowed by
// another /users route, and not silently 200).
const verifyMock = vi.hoisted(() => vi.fn());
vi.mock('svix', () => ({
  Webhook: class {
    verify(payload: unknown, headers: unknown) {
      return verifyMock(payload, headers);
    }
  },
}));

// Stand-in for Story 1.8's global ClerkAuthGuard: honours @Public(), otherwise
// reads a test role header and attaches req.user exactly as the real guard
// attaches the token-resolved user. This lets us drive the REAL RolesGuard
// (authZ) over HTTP with a caller of a chosen role.
@Injectable()
class FakeAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const req = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string>; user?: AuthUser }>();
    const role = req.headers['x-test-role'] as Role | undefined;
    if (!role) throw new UnauthorizedException();
    req.user = { id: 'user-1', clerkId: 'clerk-1', role };
    return true;
  }
}

describe('Users admin authZ + webhook route over real HTTP', () => {
  let app: INestApplication;
  const service = {
    getMe: vi.fn().mockResolvedValue({
      id: 'user-1',
      name: 'A',
      email: 'a@x.in',
      role: 'OWNER_ADMIN',
    }),
    list: vi.fn().mockResolvedValue([]),
    invite: vi.fn().mockResolvedValue({ id: 'inv1' }),
    updateRole: vi
      .fn()
      .mockResolvedValue({ id: 'user-1', role: 'OWNER_ADMIN' }),
    handleUserCreated: vi.fn(),
    handleUserUpdated: vi.fn(),
    handleUserDeleted: vi.fn(),
  };

  beforeEach(async () => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';
    verifyMock.mockReset();
    for (const fn of Object.values(service)) fn.mockClear();

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController, ClerkWebhookController],
      providers: [
        Reflector,
        { provide: UsersService, useValue: service },
        { provide: APP_GUARD, useClass: FakeAuthGuard },
      ],
    }).compile();
    // rawBody: true mirrors main.ts so the webhook route sees req.rawBody and
    // the Svix verification path is actually exercised.
    app = moduleRef.createNestApplication({ rawBody: true });
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('403s a SITE_SUPERVISOR from GET /users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('x-test-role', 'SITE_SUPERVISOR');
    expect(res.status).toBe(403);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('403s a SITE_SUPERVISOR from POST /users/invite', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/invite')
      .set('x-test-role', 'SITE_SUPERVISOR')
      .send({ email: 'new@x.in', role: 'SITE_SUPERVISOR' });
    expect(res.status).toBe(403);
    expect(service.invite).not.toHaveBeenCalled();
  });

  it('403s a SITE_SUPERVISOR from PATCH /users/:id/role', async () => {
    const res = await request(app.getHttpServer())
      .patch('/users/user-2/role')
      .set('x-test-role', 'SITE_SUPERVISOR')
      .send({ role: 'OWNER_ADMIN' });
    expect(res.status).toBe(403);
    expect(service.updateRole).not.toHaveBeenCalled();
  });

  it('allows an OWNER_ADMIN through GET /users', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('x-test-role', 'OWNER_ADMIN');
    expect(res.status).toBe(200);
    expect(service.list).toHaveBeenCalled();
  });

  it('lets ANY authenticated role read GET /users/me (no @Roles restriction)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('x-test-role', 'SITE_SUPERVISOR');
    expect(res.status).toBe(200);
    expect(service.getMe).toHaveBeenCalledWith('user-1');
  });

  it('401s an unauthenticated caller on /users/me (global guard runs first)', async () => {
    const res = await request(app.getHttpServer()).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('reaches POST /webhooks/clerk with no session token (@Public) and 401s an unverified payload', async () => {
    verifyMock.mockImplementation(() => {
      throw new Error('bad signature');
    });
    const res = await request(app.getHttpServer())
      .post('/webhooks/clerk')
      .set('svix-id', 'id')
      .set('svix-timestamp', 't')
      .set('svix-signature', 'sig')
      .send({ type: 'user.created' });
    expect(res.status).toBe(401);
    expect(service.handleUserCreated).not.toHaveBeenCalled();
  });
});
