import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function makePrisma(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  refreshTokenCreate?: ReturnType<typeof vi.fn>;
  refreshTokenFindUnique?: ReturnType<typeof vi.fn>;
  refreshTokenUpdate?: ReturnType<typeof vi.fn>;
  refreshTokenUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  return {
    user: { findUnique: overrides.findUnique ?? vi.fn() },
    refreshToken: {
      create: overrides.refreshTokenCreate ?? vi.fn().mockResolvedValue({}),
      findUnique: overrides.refreshTokenFindUnique ?? vi.fn(),
      update: overrides.refreshTokenUpdate ?? vi.fn().mockResolvedValue({}),
      updateMany:
        overrides.refreshTokenUpdateMany ?? vi.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaService;
}

function makeJwtService(signAsync: ReturnType<typeof vi.fn>) {
  return { signAsync } as unknown as JwtService;
}

describe('AuthService.login', () => {
  it('returns a signed access token and a fresh refresh token for a matching email/password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    const refreshTokenCreate = vi.fn().mockResolvedValue({});
    const prisma = makePrisma({
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-1',
        role: 'OWNER_ADMIN',
        passwordHash: hash,
      }),
      refreshTokenCreate,
    });
    const signAsync = vi.fn().mockResolvedValue('signed-jwt');
    const service = new AuthService(prisma, makeJwtService(signAsync));

    const result = await service.login({
      email: 'owner@example.com',
      password: 'correct-password',
    });

    expect(result.token).toBe('signed-jwt');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.refreshToken.length).toBeGreaterThan(0);
    expect(signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'OWNER_ADMIN',
    });
    expect(refreshTokenCreate).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        tokenHash: hashToken(result.refreshToken),
        expiresAt: expect.any(Date),
      },
    });
  });

  it('rejects an unknown email with a generic 401', async () => {
    const prisma = makePrisma({ findUnique: vi.fn().mockResolvedValue(null) });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong password with the same generic 401 as an unknown email', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    const prisma = makePrisma({
      findUnique: vi.fn().mockResolvedValue({
        id: 'user-1',
        role: 'OWNER_ADMIN',
        passwordHash: hash,
      }),
    });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    const unknownEmail = service
      .login({ email: 'nobody@example.com', password: 'whatever' })
      .catch((error: UnauthorizedException) => error.message);
    const wrongPassword = service
      .login({ email: 'owner@example.com', password: 'wrong' })
      .catch((error: UnauthorizedException) => error.message);

    expect(await unknownEmail).toBe(await wrongPassword);
  });
});

describe('AuthService.refresh', () => {
  it('rotates a valid refresh token: revokes the old row, returns a new access + refresh token', async () => {
    const raw = 'a'.repeat(64);
    const refreshTokenUpdate = vi.fn().mockResolvedValue({});
    const refreshTokenCreate = vi.fn().mockResolvedValue({});
    const prisma = makePrisma({
      refreshTokenFindUnique: vi.fn().mockResolvedValue({
        id: 'rt-1',
        tokenHash: hashToken(raw),
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: { id: 'user-1', role: 'OWNER_ADMIN' },
      }),
      refreshTokenUpdate,
      refreshTokenCreate,
    });
    const signAsync = vi.fn().mockResolvedValue('new-jwt');
    const service = new AuthService(prisma, makeJwtService(signAsync));

    const result = await service.refresh(raw);

    expect(result.token).toBe('new-jwt');
    expect(result.refreshToken).not.toBe(raw);
    expect(refreshTokenUpdate).toHaveBeenCalledWith({
      where: { id: 'rt-1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'OWNER_ADMIN',
    });
  });

  it('rejects an unknown token', async () => {
    const prisma = makePrisma({
      refreshTokenFindUnique: vi.fn().mockResolvedValue(null),
    });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(service.refresh('nope')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an already-revoked token (replay of a rotated-out token)', async () => {
    const prisma = makePrisma({
      refreshTokenFindUnique: vi.fn().mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'x',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        user: { id: 'user-1', role: 'OWNER_ADMIN' },
      }),
    });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(service.refresh('stale')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an expired token', async () => {
    const prisma = makePrisma({
      refreshTokenFindUnique: vi.fn().mockResolvedValue({
        id: 'rt-1',
        tokenHash: 'x',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'user-1', role: 'OWNER_ADMIN' },
      }),
    });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(service.refresh('expired')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

describe('AuthService.logout', () => {
  it('revokes the matching, still-live refresh token', async () => {
    const refreshTokenUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = makePrisma({ refreshTokenUpdateMany });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await service.logout('some-raw-token');

    expect(refreshTokenUpdateMany).toHaveBeenCalledWith({
      where: { tokenHash: hashToken('some-raw-token'), revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('is silent (no throw) for an unknown token', async () => {
    const prisma = makePrisma({
      refreshTokenUpdateMany: vi.fn().mockResolvedValue({ count: 0 }),
    });
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(service.logout('unknown')).resolves.toBeUndefined();
  });
});
