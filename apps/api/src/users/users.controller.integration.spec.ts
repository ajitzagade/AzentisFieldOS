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
import { UsersService } from './users.service';

// Stand-in for the global CustomAuthGuard: honours @Public(), otherwise reads
// a test role header and attaches req.user exactly as the real guard attaches
// the token-resolved user. This lets us drive the REAL RolesGuard (authZ)
// over HTTP with a caller of a chosen role.
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
    req.user = { id: 'user-1', role };
    return true;
  }
}

describe('Users admin authZ over real HTTP', () => {
  let app: INestApplication;
  const service = {
    getMe: vi.fn().mockResolvedValue({
      id: 'user-1',
      name: 'A',
      email: 'a@x.in',
      role: 'OWNER_ADMIN',
    }),
    list: vi.fn().mockResolvedValue([]),
    createUser: vi.fn().mockResolvedValue({ id: 'u2' }),
    updateRole: vi
      .fn()
      .mockResolvedValue({ id: 'user-1', role: 'OWNER_ADMIN' }),
  };

  beforeEach(async () => {
    for (const fn of Object.values(service)) fn.mockClear();

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        Reflector,
        { provide: UsersService, useValue: service },
        { provide: APP_GUARD, useClass: FakeAuthGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
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

  it('403s a SITE_SUPERVISOR from POST /users', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('x-test-role', 'SITE_SUPERVISOR')
      .send({
        name: 'New',
        email: 'new@x.in',
        role: 'SITE_SUPERVISOR',
        password: 'a-strong-password',
      });
    expect(res.status).toBe(403);
    expect(service.createUser).not.toHaveBeenCalled();
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

  it('allows an OWNER_ADMIN to create a user via POST /users', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .set('x-test-role', 'OWNER_ADMIN')
      .send({
        name: 'New Person',
        email: 'new@x.in',
        role: 'SITE_SUPERVISOR',
        password: 'a-strong-password',
      });
    expect(res.status).toBe(201);
    expect(service.createUser).toHaveBeenCalled();
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
});
