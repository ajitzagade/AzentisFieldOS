import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import type { PrismaService } from '../prisma/prisma.service';

function makePrisma(findUnique: ReturnType<typeof vi.fn>) {
  return { user: { findUnique } } as unknown as PrismaService;
}

function makeJwtService(signAsync: ReturnType<typeof vi.fn>) {
  return { signAsync } as unknown as JwtService;
}

describe('AuthService.login', () => {
  it('returns a signed token for a matching email/password', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    const prisma = makePrisma(
      vi.fn().mockResolvedValue({
        id: 'user-1',
        role: 'OWNER_ADMIN',
        passwordHash: hash,
      }),
    );
    const signAsync = vi.fn().mockResolvedValue('signed-jwt');
    const service = new AuthService(prisma, makeJwtService(signAsync));

    const result = await service.login({
      email: 'owner@example.com',
      password: 'correct-password',
    });

    expect(result).toEqual({ token: 'signed-jwt' });
    expect(signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      role: 'OWNER_ADMIN',
    });
  });

  it('rejects an unknown email with a generic 401', async () => {
    const prisma = makePrisma(vi.fn().mockResolvedValue(null));
    const service = new AuthService(prisma, makeJwtService(vi.fn()));

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a wrong password with the same generic 401 as an unknown email', async () => {
    const hash = await bcrypt.hash('correct-password', 10);
    const prisma = makePrisma(
      vi.fn().mockResolvedValue({
        id: 'user-1',
        role: 'OWNER_ADMIN',
        passwordHash: hash,
      }),
    );
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
