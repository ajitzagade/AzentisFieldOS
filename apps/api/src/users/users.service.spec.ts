import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { UserJSON } from '@clerk/backend';
import { Prisma } from '../generated/prisma/client';
import { UsersService } from './users.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  count?: ReturnType<typeof vi.fn>;
  upsert?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  getInvitationList?: ReturnType<typeof vi.fn>;
  createInvitation?: ReturnType<typeof vi.fn>;
} = {}) {
  const prisma = {
    user: {
      findUnique: overrides.findUnique ?? vi.fn(),
      findMany: overrides.findMany ?? vi.fn().mockResolvedValue([]),
      count: overrides.count ?? vi.fn().mockResolvedValue(0),
      upsert: overrides.upsert ?? vi.fn(),
      update: overrides.update ?? vi.fn(),
    },
  };
  const clerk = {
    invitations: {
      getInvitationList:
        overrides.getInvitationList ??
        vi.fn().mockResolvedValue({ data: [], totalCount: 0 }),
      createInvitation: overrides.createInvitation ?? vi.fn(),
    },
  };
  const service = new UsersService(
    prisma as unknown as ConstructorParameters<typeof UsersService>[0],
    clerk as unknown as ConstructorParameters<typeof UsersService>[1],
  );
  return { service, prisma, clerk };
}

function userJson(overrides: Partial<UserJSON> = {}): UserJSON {
  return {
    id: 'clerk_1',
    first_name: 'Ramesh',
    last_name: 'Yadav',
    username: null,
    primary_email_address_id: 'email_1',
    email_addresses: [
      {
        id: 'email_1',
        email_address: 'ramesh@azentis.in',
      },
    ],
    public_metadata: {},
    ...overrides,
  } as unknown as UserJSON;
}

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, { code: 'P2025', message: 'not found' });
}

describe('UsersService.handleUserCreated (webhook role assignment)', () => {
  it('assigns OWNER_ADMIN to the very first User in the database', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u1', role: 'OWNER_ADMIN' });
    // No OTHER user exists yet.
    const { service } = makeService({
      count: vi.fn().mockResolvedValue(0),
      upsert,
    });

    await service.handleUserCreated(
      userJson({ id: 'clerk_owner', public_metadata: {} }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'clerk_owner' },
        create: expect.objectContaining({ role: 'OWNER_ADMIN' }),
        update: expect.objectContaining({ role: 'OWNER_ADMIN' }),
      }),
    );
  });

  it('assigns the invited role from publicMetadata for a subsequent user', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u2' });
    const { service } = makeService({
      count: vi.fn().mockResolvedValue(1), // one other user already exists
      upsert,
    });

    await service.handleUserCreated(
      userJson({ id: 'clerk_2', public_metadata: { role: 'OWNER_ADMIN' } }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ role: 'OWNER_ADMIN' }),
        update: expect.objectContaining({ role: 'OWNER_ADMIN' }),
      }),
    );
  });

  it('defaults a subsequent user with no invitation metadata to SITE_SUPERVISOR', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u3' });
    const { service } = makeService({
      count: vi.fn().mockResolvedValue(1),
      upsert,
    });

    await service.handleUserCreated(
      userJson({ id: 'clerk_3', public_metadata: {} }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ role: 'SITE_SUPERVISOR' }),
      }),
    );
  });

  it('rejects a bogus publicMetadata role and falls back to SITE_SUPERVISOR (AD-11)', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u4' });
    const { service } = makeService({
      count: vi.fn().mockResolvedValue(1),
      upsert,
    });

    await service.handleUserCreated(
      userJson({ id: 'clerk_4', public_metadata: { role: 'PLATFORM_OPERATOR' } }),
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ role: 'SITE_SUPERVISOR' }),
      }),
    );
  });

  it('coordination: when the guard already provisioned this clerkId, the invited role overwrites the guard default via upsert.update', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u5', role: 'OWNER_ADMIN' });
    // The guard already created THIS user (count of OTHER users is 1: an
    // earlier Owner). The webhook is authoritative — update wins.
    const { service } = makeService({
      count: vi.fn().mockResolvedValue(1),
      upsert,
    });

    await service.handleUserCreated(
      userJson({ id: 'clerk_5', public_metadata: { role: 'OWNER_ADMIN' } }),
    );

    const call = upsert.mock.calls[0]![0] as { update: { role: string } };
    expect(call.update.role).toBe('OWNER_ADMIN');
  });

  it('counts only OTHER users, so a guard-provisioned first user still resolves to OWNER_ADMIN', async () => {
    const count = vi.fn().mockResolvedValue(0);
    const upsert = vi.fn().mockResolvedValue({ id: 'u6' });
    const { service } = makeService({ count, upsert });

    await service.handleUserCreated(
      userJson({ id: 'clerk_owner', public_metadata: {} }),
    );

    // The count query must exclude this clerkId.
    expect(count).toHaveBeenCalledWith({ where: { NOT: { clerkId: 'clerk_owner' } } });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ create: expect.objectContaining({ role: 'OWNER_ADMIN' }) }),
    );
  });
});

describe('UsersService.handleUserUpdated', () => {
  it('syncs name/email but never touches role (an admin may have changed it)', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1' });
    const { service } = makeService({
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: 'u1', clerkId: 'clerk_1', email: 'old@x.in', role: 'OWNER_ADMIN' }),
      update,
    });

    await service.handleUserUpdated(
      userJson({ id: 'clerk_1', first_name: 'New', last_name: 'Name' }),
    );

    const call = update.mock.calls[0]![0] as { data: Record<string, unknown> };
    expect(call.data).not.toHaveProperty('role');
    expect(call.data).toMatchObject({ name: 'New Name' });
  });

  it('falls back to create when the user was never seen (out-of-order events)', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'u1' });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(1),
      upsert,
    });

    await service.handleUserUpdated(userJson({ id: 'clerk_x' }));

    expect(upsert).toHaveBeenCalled();
  });
});

describe('UsersService.list (merged users + pending invitations)', () => {
  it('merges Active local users with Pending Clerk invitations', async () => {
    const { service } = makeService({
      findMany: vi.fn().mockResolvedValue([
        { id: 'u1', name: 'Suresh Rao', email: 'suresh@azentis.in', role: 'OWNER_ADMIN' },
      ]),
      getInvitationList: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'inv1',
            emailAddress: 'new@azentis.in',
            publicMetadata: { role: 'SITE_SUPERVISOR' },
          },
        ],
        totalCount: 1,
      }),
    });

    const rows = await service.list();

    expect(rows).toEqual([
      { id: 'u1', name: 'Suresh Rao', email: 'suresh@azentis.in', role: 'OWNER_ADMIN', status: 'Active' },
      { id: 'inv1', name: null, email: 'new@azentis.in', role: 'SITE_SUPERVISOR', status: 'Pending' },
    ]);
  });

  it('drops a pending invitation whose email is already an Active user (accept race)', async () => {
    const { service } = makeService({
      findMany: vi
        .fn()
        .mockResolvedValue([{ id: 'u1', name: 'A', email: 'dup@azentis.in', role: 'OWNER_ADMIN' }]),
      getInvitationList: vi.fn().mockResolvedValue({
        data: [{ id: 'inv1', emailAddress: 'DUP@azentis.in', publicMetadata: {} }],
        totalCount: 1,
      }),
    });

    const rows = await service.list();
    expect(rows).toHaveLength(1);
    expect(rows[0]!.status).toBe('Active');
  });

  it('requests only pending invitations from Clerk', async () => {
    const getInvitationList = vi.fn().mockResolvedValue({ data: [], totalCount: 0 });
    const { service } = makeService({ getInvitationList });
    await service.list();
    expect(getInvitationList).toHaveBeenCalledWith({ status: 'pending' });
  });
});

describe('UsersService.invite', () => {
  it('creates a Clerk invitation carrying the role in publicMetadata', async () => {
    const createInvitation = vi
      .fn()
      .mockResolvedValue({ id: 'inv1', emailAddress: 'new@azentis.in' });
    const { service } = makeService({ createInvitation });

    const result = await service.invite({ email: 'new@azentis.in', role: 'SITE_SUPERVISOR' });

    expect(createInvitation).toHaveBeenCalledWith({
      emailAddress: 'new@azentis.in',
      publicMetadata: { role: 'SITE_SUPERVISOR' },
    });
    expect(result).toMatchObject({ email: 'new@azentis.in', role: 'SITE_SUPERVISOR', status: 'Pending' });
  });
});

describe('UsersService.updateRole', () => {
  it('updates the User row in place', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'u1', role: 'OWNER_ADMIN' });
    const { service } = makeService({ update });

    const result = await service.updateRole('u1', { role: 'OWNER_ADMIN' });

    expect(update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { role: 'OWNER_ADMIN' } });
    expect(result).toEqual({ id: 'u1', role: 'OWNER_ADMIN' });
  });

  it('throws NotFoundException, not a raw 500, for a missing User (P2025)', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(service.updateRole('missing', { role: 'OWNER_ADMIN' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('UsersService.getMe', () => {
  it('returns the id/name/email/role subset for the current user', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue({
        id: 'u1',
        clerkId: 'clerk_1',
        name: 'Suresh Rao',
        email: 'suresh@azentis.in',
        role: 'OWNER_ADMIN',
        createdAt: new Date(),
      }),
    });

    await expect(service.getMe('u1')).resolves.toEqual({
      id: 'u1',
      name: 'Suresh Rao',
      email: 'suresh@azentis.in',
      role: 'OWNER_ADMIN',
    });
  });

  it('throws NotFoundException when the row vanished mid-request', async () => {
    const { service } = makeService({ findUnique: vi.fn().mockResolvedValue(null) });
    await expect(service.getMe('gone')).rejects.toThrow(NotFoundException);
  });
});
