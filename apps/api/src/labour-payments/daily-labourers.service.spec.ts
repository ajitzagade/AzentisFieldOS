import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourersService } from './daily-labourers.service';

function makeService(
  overrides: {
    create?: ReturnType<typeof vi.fn>;
    findMany?: ReturnType<typeof vi.fn>;
    count?: ReturnType<typeof vi.fn>;
    findUnique?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const prisma = {
    dailyLabourer: {
      create: overrides.create ?? vi.fn().mockResolvedValue({ id: 'l1' }),
      findMany: overrides.findMany ?? vi.fn().mockResolvedValue([]),
      count: overrides.count ?? vi.fn().mockResolvedValue(0),
      findUnique: overrides.findUnique ?? vi.fn(),
    },
  };
  return {
    service: new DailyLabourersService(
      prisma as unknown as ConstructorParameters<
        typeof DailyLabourersService
      >[0],
    ),
    prisma,
  };
}

describe('DailyLabourersService', () => {
  it('create passes the input straight through to dailyLabourer.create', async () => {
    const { service, prisma } = makeService();
    const input = {
      name: 'Ramesh',
      category: 'Mistri' as const,
      isActive: true,
    };

    await service.create(input);

    expect(prisma.dailyLabourer.create).toHaveBeenCalledWith({ data: input });
  });

  describe('list', () => {
    it('orders Labourers by name ascending with no filters', async () => {
      const { service, prisma } = makeService();

      const result = await service.list();

      expect(prisma.dailyLabourer.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([]);
    });

    it('searches by name OR category, case-insensitively', async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { service } = makeService({ findMany });

      await service.list({ q: 'mistri' });

      expect(findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'mistri', mode: 'insensitive' } },
            { category: { contains: 'mistri', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });

    it('sorts by an allowed field and direction', async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { service } = makeService({ findMany });

      await service.list({ sort: 'category', order: 'desc' });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { category: 'desc' } }),
      );
    });

    it('falls back to the default name sort for an unrecognized sort field', async () => {
      const findMany = vi.fn().mockResolvedValue([]);
      const { service } = makeService({ findMany });

      await service.list({ sort: 'outstandingAdvanceBalance' });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
    });

    it('returns a paginated envelope once page/pageSize is requested', async () => {
      const findMany = vi
        .fn()
        .mockResolvedValue([{ id: 'l1', name: 'Ramesh Kumar' }]);
      const count = vi.fn().mockResolvedValue(12);
      const { service } = makeService({ findMany, count });

      const result = await service.list({ page: '1', pageSize: '10' });

      expect(findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        rows: [{ id: 'l1', name: 'Ramesh Kumar' }],
        total: 12,
        page: 1,
        pageSize: 10,
      });
    });
  });

  it('findOne throws NotFoundException when no Labourer matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
