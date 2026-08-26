import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { ExpenseCategoriesService } from './expense-categories.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const create =
    overrides.create ?? vi.fn().mockResolvedValue({ id: 'c1', name: 'Fuel' });
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const update =
    overrides.update ?? vi.fn().mockResolvedValue({ id: 'c1', name: 'Fuel' });
  const prisma = { expenseCategory: { create, findMany, update } };
  const service = new ExpenseCategoriesService(
    prisma as unknown as ConstructorParameters<
      typeof ExpenseCategoriesService
    >[0],
  );
  return { service, create, findMany, update };
}

function knownError(code: string) {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, { code, message: code });
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

  it('update (Story 14.3) renames via prisma.expenseCategory.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'c1', name: 'Diesel' });
    const { service } = makeService({ update });

    await service.update('c1', { name: 'Diesel' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { name: 'Diesel' },
    });
  });

  it('update (Story 14.3) disables via prisma.expenseCategory.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'c1', isActive: false });
    const { service } = makeService({ update });

    await service.update('c1', { isActive: false });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { isActive: false },
    });
  });

  it('update throws NotFoundException when Prisma reports P2025', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2025'));
    const { service } = makeService({ update });

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update translates a duplicate-name P2002 into a 400', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2002'));
    const { service } = makeService({ update });

    await expect(service.update('c1', { name: 'Fuel' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
