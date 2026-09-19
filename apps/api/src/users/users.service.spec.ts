import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from './users.service';

function makeService(
  overrides: {
    findMany?: ReturnType<typeof vi.fn>;
    create?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
    refreshTokenUpdateMany?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const prisma = {
    user: {
      findMany: overrides.findMany ?? vi.fn().mockResolvedValue([]),
      create: overrides.create ?? vi.fn(),
      update: overrides.update ?? vi.fn(),
    },
    refreshToken: {
      updateMany:
        overrides.refreshTokenUpdateMany ??
        vi.fn().mockResolvedValue({ count: 0 }),
    },
    // Mirrors the real array form: settles every listed operation together.
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };
  const service = new UsersService(
    prisma as unknown as ConstructorParameters<typeof UsersService>[0],
  );
  return { service, prisma };
}

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, { code: 'P2025', message: 'not found' });
}

function p2002Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2002',
    message: 'Unique constraint failed on email',
  });
}

describe('UsersService.createUser', () => {
  it('hashes the password and creates the User row directly (no invitation state)', async () => {
    const create = vi.fn().mockResolvedValue({
      id: 'u1',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      role: 'SITE_SUPERVISOR',
    });
    const { service } = makeService({ create });

    await service.createUser({
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      role: 'SITE_SUPERVISOR',
      password: 'a-strong-password',
    });

    const call = create.mock.calls[0]![0] as {
      data: { passwordHash: string; name: string; email: string; role: string };
    };
    expect(call.data.name).toBe('Suresh Rao');
    expect(call.data.email).toBe('suresh@azentis.in');
    expect(call.data.role).toBe('SITE_SUPERVISOR');
    // Never stores the plaintext password.
    expect(call.data.passwordHash).not.toBe('a-strong-password');
    await expect(
      bcrypt.compare('a-strong-password', call.data.passwordHash),
    ).resolves.toBe(true);
  });

  it('throws ConflictException, not a raw 500, for a duplicate email (P2002)', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const { service } = makeService({ create });

    await expect(
      service.createUser({
        name: 'Dup',
        email: 'dup@azentis.in',
        role: 'SITE_SUPERVISOR',
        password: 'a-strong-password',
      }),
    ).rejects.toThrow(ConflictException);
  });
});

describe('UsersService.list', () => {
  it('returns every local User with no status/invitation concept', async () => {
    const { service } = makeService({
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'u1',
          name: 'Suresh Rao',
          email: 'suresh@azentis.in',
          role: 'OWNER_ADMIN',
        },
      ]),
    });

    const rows = await service.list();

    expect(rows).toEqual([
      {
        id: 'u1',
        name: 'Suresh Rao',
        email: 'suresh@azentis.in',
        role: 'OWNER_ADMIN',
      },
    ]);
  });
});

describe('UsersService.updateRole', () => {
  it('updates the User row in place, never selecting passwordHash back out', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1', role: 'OWNER_ADMIN' });
    const { service } = makeService({ update });

    const result = await service.updateRole('u1', { role: 'OWNER_ADMIN' });

    const call = update.mock.calls[0]![0] as {
      where: { id: string };
      data: { role: string };
      select?: Record<string, boolean>;
    };
    expect(call.where).toEqual({ id: 'u1' });
    expect(call.data).toEqual({ role: 'OWNER_ADMIN' });
    expect(call.select).not.toHaveProperty('passwordHash');
    expect(result).toEqual({ id: 'u1', role: 'OWNER_ADMIN' });
  });

  it('throws NotFoundException, not a raw 500, for a missing User (P2025)', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(
      service.updateRole('missing', { role: 'OWNER_ADMIN' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('UsersService.resetPassword', () => {
  it('stores a bcrypt hash (never the plaintext) and revokes outstanding refresh tokens', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1' });
    const refreshTokenUpdateMany = vi.fn().mockResolvedValue({ count: 2 });
    const { service } = makeService({ update, refreshTokenUpdateMany });

    await service.resetPassword('u1', { password: 'a-new-password' });

    const call = update.mock.calls[0]![0] as {
      where: { id: string };
      data: { passwordHash: string };
      select?: Record<string, boolean>;
    };
    expect(call.where).toEqual({ id: 'u1' });
    expect(call.data.passwordHash).not.toBe('a-new-password');
    await expect(
      bcrypt.compare('a-new-password', call.data.passwordHash),
    ).resolves.toBe(true);
    expect(call.select).not.toHaveProperty('passwordHash');
    expect(refreshTokenUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it('throws NotFoundException for a missing User (P2025)', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(
      service.resetPassword('missing', { password: 'a-new-password' }),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('UsersService.setActive', () => {
  it('deactivates the account and revokes its outstanding refresh tokens', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1', isActive: false });
    const refreshTokenUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const { service } = makeService({ update, refreshTokenUpdateMany });

    const result = await service.setActive(
      'u1',
      { isActive: false },
      'admin-1',
    );

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: { isActive: false },
      }),
    );
    expect(refreshTokenUpdateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result).toEqual({ id: 'u1', isActive: false });
  });

  it('reactivates a deactivated account WITHOUT touching refresh tokens (a redundant call must be a true no-op)', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1', isActive: true });
    const refreshTokenUpdateMany = vi.fn();
    const { service } = makeService({ update, refreshTokenUpdateMany });

    await service.setActive('u1', { isActive: true }, 'admin-1');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: true } }),
    );
    expect(refreshTokenUpdateMany).not.toHaveBeenCalled();
  });

  it('refuses to let an admin deactivate their own account', async () => {
    const update = vi.fn();
    const { service } = makeService({ update });

    await expect(
      service.setActive('admin-1', { isActive: false }, 'admin-1'),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('throws NotFoundException for a missing User (P2025)', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(
      service.setActive('missing', { isActive: false }, 'admin-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
