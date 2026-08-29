import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from './users.service';

function makeService(
  overrides: {
    findUnique?: ReturnType<typeof vi.fn>;
    findMany?: ReturnType<typeof vi.fn>;
    create?: ReturnType<typeof vi.fn>;
    update?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const prisma = {
    user: {
      findUnique: overrides.findUnique ?? vi.fn(),
      findMany: overrides.findMany ?? vi.fn().mockResolvedValue([]),
      create: overrides.create ?? vi.fn(),
      update: overrides.update ?? vi.fn(),
    },
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

describe('UsersService.getMe', () => {
  it('returns the safe row for the current user, never selecting passwordHash', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'u1',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      role: 'OWNER_ADMIN',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });
    const { service } = makeService({ findUnique });

    await expect(service.getMe('u1')).resolves.toMatchObject({
      id: 'u1',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      role: 'OWNER_ADMIN',
    });
    const call = findUnique.mock.calls[0]![0] as {
      select?: Record<string, boolean>;
    };
    expect(call.select).not.toHaveProperty('passwordHash');
  });

  it('throws NotFoundException when the row vanished mid-request', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });
    await expect(service.getMe('gone')).rejects.toThrow(NotFoundException);
  });
});
