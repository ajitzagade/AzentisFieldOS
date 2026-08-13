import { describe, expect, it, vi } from 'vitest';
import { getPlaceholderUserId } from './get-placeholder-user-id';
import { Prisma } from '../generated/prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

function p2002Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2002',
    message: 'Unique constraint failed on the fields: (`email`)',
  });
}

describe('getPlaceholderUserId', () => {
  it('creates the placeholder user when none exists yet', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'user-1' });
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create,
        findUniqueOrThrow: vi.fn(),
      },
    } as unknown as PrismaService;

    const id = await getPlaceholderUserId(prisma);

    expect(id).toBe('user-1');
    expect(create).toHaveBeenCalled();
  });

  it('returns the existing placeholder user without attempting to create it again', async () => {
    const create = vi.fn();
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-1' }),
        create,
        findUniqueOrThrow: vi.fn(),
      },
    } as unknown as PrismaService;

    const id = await getPlaceholderUserId(prisma);

    expect(id).toBe('user-1');
    expect(create).not.toHaveBeenCalled();
  });

  it('recovers from a concurrent-creation race instead of surfacing a raw P2002', async () => {
    // Simulates two callers both seeing findUnique() return null before
    // either commits: this caller's create() loses the race and throws
    // P2002 on the unique email — it should re-fetch the winner's row
    // instead of propagating the error.
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockRejectedValue(p2002Error()),
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'winner-user-id' }),
      },
    } as unknown as PrismaService;

    const id = await getPlaceholderUserId(prisma);

    expect(id).toBe('winner-user-id');
  });

  it('re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockRejectedValue(otherError),
        findUniqueOrThrow: vi.fn(),
      },
    } as unknown as PrismaService;

    await expect(getPlaceholderUserId(prisma)).rejects.toThrow(
      'connection lost',
    );
  });
});
