import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomAuthGuard } from './custom-auth.guard';
import type { PrismaService } from '../prisma/prisma.service';

interface RequestLike {
  headers: Record<string, string | undefined>;
  user?: { id: string; role: string };
}

function makeContext(headers: Record<string, string | undefined>): {
  context: ExecutionContext;
  request: RequestLike;
} {
  const request: RequestLike = { headers };
  const context = {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

function makeReflector(isPublic: boolean): Reflector {
  return {
    getAllAndOverride: vi.fn().mockReturnValue(isPublic),
  } as unknown as Reflector;
}

function makeJwtService(
  verifyAsync: ReturnType<typeof vi.fn> = vi.fn(),
): JwtService {
  return { verifyAsync } as unknown as JwtService;
}

function makePrisma(findUnique: ReturnType<typeof vi.fn> = vi.fn()): {
  prisma: PrismaService;
  user: { findUnique: ReturnType<typeof vi.fn> };
} {
  const user = { findUnique };
  return { prisma: { user } as unknown as PrismaService, user };
}

describe('CustomAuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies the bearer token, resolves the User by id, and attaches req.user', async () => {
    const verifyAsync = vi.fn().mockResolvedValue({ sub: 'user-1' });
    const { prisma } = makePrisma(
      vi.fn().mockResolvedValue({ id: 'user-1', role: 'SITE_SUPERVISOR' }),
    );
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(verifyAsync).toHaveBeenCalledWith('good');
    expect(request.user).toEqual({ id: 'user-1', role: 'SITE_SUPERVISOR' });
  });

  // The select carries name/email/createdAt/updatedAt too — purely so
  // GET /users/me can build its response from request.user without a
  // second DB round-trip — but must never select passwordHash.
  it('selects the safe profile fields (never passwordHash) and attaches them all to req.user', async () => {
    const verifyAsync = vi.fn().mockResolvedValue({ sub: 'user-1' });
    const findUnique = vi.fn().mockResolvedValue({
      id: 'user-1',
      role: 'OWNER_ADMIN',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    const { prisma } = makePrisma(findUnique);
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const call = findUnique.mock.calls[0]![0] as {
      select?: Record<string, boolean>;
    };
    expect(call.select).toEqual({
      id: true,
      role: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    });
    expect(call.select).not.toHaveProperty('passwordHash');
    expect(request.user).toMatchObject({
      id: 'user-1',
      role: 'OWNER_ADMIN',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
    });
  });

  it('rejects a request with no Authorization header (401), without verifying', async () => {
    const verifyAsync = vi.fn();
    const { prisma } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context } = makeContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects a malformed (non-Bearer) Authorization header (401)', async () => {
    const verifyAsync = vi.fn();
    const { prisma } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context } = makeContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an empty bearer token ("Bearer " with nothing after) as 401', async () => {
    const verifyAsync = vi.fn();
    const { prisma } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context } = makeContext({ authorization: 'Bearer ' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyAsync).not.toHaveBeenCalled();
  });

  it('reads the first value when the Authorization header arrives as an array', async () => {
    const verifyAsync = vi.fn().mockResolvedValue({ sub: 'user-1' });
    const { prisma } = makePrisma(
      vi.fn().mockResolvedValue({ id: 'user-1', role: 'SITE_SUPERVISOR' }),
    );
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({
      authorization: ['Bearer good', 'Bearer other'] as unknown as string,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyAsync).toHaveBeenCalledWith('good');
    expect(request.user?.id).toBe('user-1');
  });

  it('maps an invalid/expired/tampered token (verify throws) to a 401', async () => {
    const verifyAsync = vi.fn().mockRejectedValue(new Error('jwt expired'));
    const { prisma, user } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({
      authorization: 'Bearer expired',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(request.user).toBeUndefined();
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a verified token whose sub claim is missing/empty as 401, never querying the User table', async () => {
    const verifyAsync = vi.fn().mockResolvedValue({ sub: '' });
    const { prisma, user } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(user.findUnique).not.toHaveBeenCalled();
    expect(request.user).toBeUndefined();
  });

  it('rejects a token whose subject no longer resolves to a User (deleted account) as 401', async () => {
    const verifyAsync = vi.fn().mockResolvedValue({ sub: 'gone' });
    const { prisma } = makePrisma(vi.fn().mockResolvedValue(null));
    const guard = new CustomAuthGuard(
      makeReflector(false),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('bypasses verification entirely for a @Public() route (login / cron / health)', async () => {
    const verifyAsync = vi.fn();
    const { prisma } = makePrisma();
    const guard = new CustomAuthGuard(
      makeReflector(true),
      makeJwtService(verifyAsync),
      prisma,
    );
    const { context, request } = makeContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyAsync).not.toHaveBeenCalled();
    expect(request.user).toBeUndefined();
  });
});
