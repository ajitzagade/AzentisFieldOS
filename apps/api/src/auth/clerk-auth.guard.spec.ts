import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { Prisma } from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

// Mirrors the Cloudinary-client mock style in the storage tests:
// token verification is delegated to Clerk's backend SDK, so the SDK is
// mocked here and the guard's own logic (header parsing, user resolution,
// req.user attach, 401 mapping) is exercised against it.
const verifyTokenMock = vi.hoisted(() => vi.fn());
vi.mock('@clerk/backend', () => ({ verifyToken: verifyTokenMock }));

interface RequestLike {
  headers: Record<string, string | undefined>;
  user?: { id: string; clerkId: string; role: string };
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

function makePrisma(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  count?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
  findUniqueOrThrow?: ReturnType<typeof vi.fn>;
}): { prisma: PrismaService; user: Record<string, ReturnType<typeof vi.fn>> } {
  const user = {
    findUnique: overrides.findUnique ?? vi.fn(),
    count: overrides.count ?? vi.fn(),
    create: overrides.create ?? vi.fn(),
    findUniqueOrThrow: overrides.findUniqueOrThrow ?? vi.fn(),
  };
  return { prisma: { user } as unknown as PrismaService, user };
}

beforeEach(() => {
  verifyTokenMock.mockReset();
});

describe('ClerkAuthGuard', () => {
  it('verifies the bearer token via the Clerk SDK, resolves the existing User, and attaches req.user', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-abc' });
    const { prisma, user } = makePrisma({
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-abc',
        role: 'SITE_SUPERVISOR',
      }),
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(verifyTokenMock).toHaveBeenCalledWith('good', {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    expect(request.user).toEqual({
      id: 'user-1',
      clerkId: 'clerk-abc',
      role: 'SITE_SUPERVISOR',
    });
    expect(user.create).not.toHaveBeenCalled();
  });

  it('provisions the very first User as OWNER_ADMIN (the owner sets up first)', async () => {
    verifyTokenMock.mockResolvedValue({
      sub: 'clerk-owner',
      email: 'owner@example.com',
      name: 'Owner Person',
    });
    const create = vi.fn().mockResolvedValue({
      id: 'user-owner',
      clerkId: 'clerk-owner',
      role: 'OWNER_ADMIN',
    });
    const { prisma } = makePrisma({
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create,
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-owner',
        name: 'Owner Person',
        email: 'owner@example.com',
        role: 'OWNER_ADMIN',
      },
    });
    expect(request.user?.role).toBe('OWNER_ADMIN');
  });

  it('provisions a subsequent first-seen User as SITE_SUPERVISOR', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-new' });
    const create = vi.fn().mockResolvedValue({
      id: 'user-new',
      clerkId: 'clerk-new',
      role: 'SITE_SUPERVISOR',
    });
    const { prisma } = makePrisma({
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(3),
      create,
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-new',
        name: 'User',
        email: 'clerk-new@users.noreply.local',
        role: 'SITE_SUPERVISOR',
      },
    });
  });

  it('falls back to a deterministic name/email when the token carries no such claims', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-bare' });
    const create = vi.fn().mockResolvedValue({
      id: 'user-bare',
      clerkId: 'clerk-bare',
      role: 'OWNER_ADMIN',
    });
    const { prisma } = makePrisma({
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create,
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({ authorization: 'Bearer good' });

    await guard.canActivate(context);

    expect(create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-bare',
        name: 'User',
        email: 'clerk-bare@users.noreply.local',
        role: 'OWNER_ADMIN',
      },
    });
  });

  it('rejects a request with no Authorization header (401), without calling the SDK', async () => {
    const { prisma } = makePrisma({});
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({});

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed (non-Bearer) Authorization header (401)', async () => {
    const { prisma } = makePrisma({});
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({ authorization: 'Basic abc123' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('maps an invalid/expired token (SDK throws) to a 401, never a placeholder fallback', async () => {
    verifyTokenMock.mockRejectedValue(new Error('token expired'));
    const { prisma, user } = makePrisma({});
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context, request } = makeContext({
      authorization: 'Bearer expired',
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(request.user).toBeUndefined();
    expect(user.findUnique).not.toHaveBeenCalled();
  });

  it('bypasses verification entirely for a @Public() route (cron / health)', async () => {
    const { prisma } = makePrisma({});
    const guard = new ClerkAuthGuard(makeReflector(true), prisma);
    const { context, request } = makeContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyTokenMock).not.toHaveBeenCalled();
    expect(request.user).toBeUndefined();
  });

  // ---- Code-review follow-ups: the guard's own defensive branches ----

  it('rejects an empty bearer token ("Bearer " with nothing after) as 401, without calling the SDK', async () => {
    const { prisma } = makePrisma({});
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({ authorization: 'Bearer ' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('reads the first value when the Authorization header arrives as an array', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-abc' });
    const { prisma } = makePrisma({
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk-abc',
        role: 'SITE_SUPERVISOR',
      }),
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    // Node can surface a repeated header as string[].
    const { context, request } = makeContext({
      authorization: ['Bearer good', 'Bearer other'] as unknown as string,
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(verifyTokenMock).toHaveBeenCalledWith('good', {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    expect(request.user?.clerkId).toBe('clerk-abc');
  });

  it('rejects a verified token whose sub claim is missing/empty as 401, never keying a User off undefined', async () => {
    verifyTokenMock.mockResolvedValue({ sub: '' });
    const findUnique = vi.fn();
    const { prisma } = makePrisma({ findUnique });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    // Never touched the User table with a bad key.
    expect(findUnique).not.toHaveBeenCalled();
    expect(request.user).toBeUndefined();
  });

  it('recovers from a concurrent-provision P2002 race by re-fetching the winner row by clerkId', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-race' });
    const p2002 = Object.assign(
      Object.create(Prisma.PrismaClientKnownRequestError.prototype) as Error,
      { code: 'P2002', message: 'Unique constraint failed on clerkId' },
    );
    const findUnique = vi.fn().mockResolvedValue(null); // loser missed the winner
    const count = vi.fn().mockResolvedValue(2);
    const create = vi.fn().mockRejectedValue(p2002); // loser's insert collides
    const findUniqueOrThrow = vi.fn().mockResolvedValue({
      id: 'user-race',
      clerkId: 'clerk-race',
      role: 'SITE_SUPERVISOR',
    });
    const { prisma } = makePrisma({
      findUnique,
      count,
      create,
      findUniqueOrThrow,
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context, request } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: { clerkId: 'clerk-race' },
    });
    expect(request.user?.id).toBe('user-race');
  });

  it('re-throws a non-P2002 create() error rather than masking it as an auth result', async () => {
    verifyTokenMock.mockResolvedValue({ sub: 'clerk-x' });
    const { prisma } = makePrisma({
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockRejectedValue(new Error('db down')),
    });
    const guard = new ClerkAuthGuard(makeReflector(false), prisma);
    const { context } = makeContext({ authorization: 'Bearer good' });

    await expect(guard.canActivate(context)).rejects.toThrow('db down');
  });
});
