import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { ExpenseCategoriesService } from './expense-categories.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
}) {
  const create =
    overrides.create ?? vi.fn().mockResolvedValue({ id: 'c1', name: 'Fuel' });
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const prisma = { expenseCategory: { create, findMany } };
  const service = new ExpenseCategoriesService(
    prisma as unknown as ConstructorParameters<
      typeof ExpenseCategoriesService
    >[0],
  );
  return { service, create, findMany };
}

describe('ExpenseCategoriesService', () => {
  it('create delegates to prisma.expenseCategory.create', async () => {
    const { service, create } = makeService({});

    await service.create({ name: 'Fuel' });

    expect(create).toHaveBeenCalledWith({ data: { name: 'Fuel' } });
  });

  it('translates a duplicate-name unique violation into a 400', async () => {
    const create = vi.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );
    const { service } = makeService({ create });

    await expect(service.create({ name: 'Fuel' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('list orders by name ascending', async () => {
    const { service, findMany } = makeService({});

    await service.list();

    expect(findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
  });
});
