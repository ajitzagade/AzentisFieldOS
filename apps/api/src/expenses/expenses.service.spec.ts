import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ExpensesService } from './expenses.service';

function makeService(overrides: {
  expenseFindUnique?: ReturnType<typeof vi.fn>;
  expenseCreate?: ReturnType<typeof vi.fn>;
  expenseFindMany?: ReturnType<typeof vi.fn>;
  expenseCount?: ReturnType<typeof vi.fn>;
  expenseAggregate?: ReturnType<typeof vi.fn>;
  expenseGroupBy?: ReturnType<typeof vi.fn>;
  categoryFindUnique?: ReturnType<typeof vi.fn>;
}) {
  const expenseFindUnique = overrides.expenseFindUnique ?? vi.fn();
  const expenseCreate =
    overrides.expenseCreate ?? vi.fn().mockResolvedValue({ id: 'x1' });
  const expenseFindMany =
    overrides.expenseFindMany ?? vi.fn().mockResolvedValue([]);
  const expenseCount = overrides.expenseCount ?? vi.fn().mockResolvedValue(0);
  const expenseAggregate =
    overrides.expenseAggregate ??
    vi.fn().mockResolvedValue({ _sum: { amount: null } });
  const expenseGroupBy =
    overrides.expenseGroupBy ?? vi.fn().mockResolvedValue([]);
  const categoryFindUnique = overrides.categoryFindUnique ?? vi.fn();

  const prisma = {
    expense: {
      findUnique: expenseFindUnique,
      create: expenseCreate,
      findMany: expenseFindMany,
      count: expenseCount,
      aggregate: expenseAggregate,
      groupBy: expenseGroupBy,
    },
    expenseCategory: {
      findUnique: categoryFindUnique,
    },
    // The read paths exclude rows belonging to a superseded (corrected)
    // DSR — no corrections in these fixtures.
    dailySiteReport: { findMany: vi.fn().mockResolvedValue([]) },
  };

  const service = new ExpensesService(
    prisma as unknown as ConstructorParameters<typeof ExpensesService>[0],
  );

  return {
    service,
    expenseFindUnique,
    expenseCreate,
    expenseFindMany,
    expenseCount,
    expenseAggregate,
    expenseGroupBy,
    categoryFindUnique,
  };
}

// Prisma Decimal stand-in — only .toNumber() is exercised.
function dec(n: number) {
  return {
    toNumber: () => n,
  } as unknown as import('../generated/prisma/client').Prisma.Decimal;
}

const baseInput = {
  siteId: 'site1',
  categoryId: 'cat1',
  amount: 5000,
  incurredAt: new Date('2026-08-13'),
};

describe('ExpensesService.create', () => {
  it('inserts the Expense row directly, coercing incurredAt to a Date', async () => {
    const { service, expenseCreate } = makeService({});

    await service.create(baseInput);

    expect(expenseCreate).toHaveBeenCalledWith({
      data: { ...baseInput, incurredAt: new Date(baseInput.incurredAt) },
      include: { site: true, category: true },
    });
  });

  it('rejects a correctsId that does not reference an existing Expense', async () => {
    const expenseFindUnique = vi.fn().mockResolvedValue(null);
    const { service, expenseCreate } = makeService({ expenseFindUnique });

    await expect(
      service.create({
        ...baseInput,
        amount: -500,
        correctsId: 'missing',
        reason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(expenseCreate).not.toHaveBeenCalled();
  });

  it('rejects a correction whose Site or Category diverges from the original', async () => {
    const expenseFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      categoryId: 'DIFFERENT',
    });
    const { service, expenseCreate } = makeService({ expenseFindUnique });

    await expect(
      service.create({
        ...baseInput,
        amount: -500,
        correctsId: 'orig',
        reason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
    expect(expenseCreate).not.toHaveBeenCalled();
  });

  it('proceeds when the correction references a matching original', async () => {
    const expenseFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      siteId: 'site1',
      categoryId: 'cat1',
    });
    const { service, expenseCreate } = makeService({ expenseFindUnique });

    await service.create({
      ...baseInput,
      amount: -500,
      correctsId: 'orig',
      reason: 'x',
    });

    expect(expenseCreate).toHaveBeenCalledOnce();
  });
});

describe('ExpensesService.list', () => {
  it('passes Site, Category, and date-range filters into the where clause', async () => {
    const { service, expenseFindMany } = makeService({});

    await service.list({
      siteId: 'site1',
      categoryId: 'cat1',
      from: '2026-08-01',
      to: '2026-08-31',
    });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { dailySiteReportId: null },
            { dailySiteReportId: { notIn: [] } },
          ],
          siteId: 'site1',
          categoryId: 'cat1',
          // `to` is inclusive of the whole day, so the upper bound is the next day.
          incurredAt: {
            gte: new Date('2026-08-01'),
            lt: new Date('2026-09-01'),
          },
        },
        include: { site: true, category: true },
      }),
    );
  });

  it('applies only the superseded-DSR exclusion when no filters are given', async () => {
    const { service, expenseFindMany } = makeService({});

    await service.list();

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { dailySiteReportId: null },
            { dailySiteReportId: { notIn: [] } },
          ],
        },
      }),
    );
  });

  it('searches description/personOrVendor case-insensitively, combined via AND alongside the superseded-DSR OR', async () => {
    const { service, expenseFindMany } = makeService({});

    await service.list({ q: 'diesel' });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        where: expect.objectContaining({
          AND: [
            {
              OR: [
                { description: { contains: 'diesel', mode: 'insensitive' } },
                { personOrVendor: { contains: 'diesel', mode: 'insensitive' } },
              ],
            },
          ],
        }),
      }),
    );
  });

  it('returns a paginated envelope once page/pageSize is requested', async () => {
    const expenseFindMany = vi.fn().mockResolvedValue([{ id: 'x1' }]);
    const expenseCount = vi.fn().mockResolvedValue(40);
    const { service } = makeService({ expenseFindMany, expenseCount });

    const result = await service.list({ page: '1', pageSize: '20' });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
    expect(result).toEqual({
      rows: [{ id: 'x1' }],
      total: 40,
      page: 1,
      pageSize: 20,
    });
  });

  it('sorts by an allowed field and direction', async () => {
    const { service, expenseFindMany } = makeService({});

    await service.list({ sort: 'amount', order: 'desc' });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { amount: 'desc' } }),
    );
  });

  it('falls back to the default incurredAt-desc sort for an unrecognized sort field', async () => {
    const { service, expenseFindMany } = makeService({});

    await service.list({ sort: 'id' });

    expect(expenseFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { incurredAt: 'desc' } }),
    );
  });
});

describe('ExpensesService.findOne', () => {
  it('throws NotFoundException when the Expense does not exist', async () => {
    const expenseFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ expenseFindUnique });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('ExpensesService.summary', () => {
  it('computes the three figures against a multi-category fixture', async () => {
    const expenseAggregate = vi
      .fn()
      .mockResolvedValueOnce({ _sum: { amount: dec(186400) } }) // month
      .mockResolvedValueOnce({ _sum: { amount: dec(63700) } }); // week
    const expenseGroupBy = vi.fn().mockResolvedValue([
      { categoryId: 'catFuel', _sum: { amount: dec(40000) } },
      { categoryId: 'catMachinery', _sum: { amount: dec(120000) } },
      { categoryId: 'catMisc', _sum: { amount: dec(26400) } },
    ]);
    const categoryFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'catMachinery', name: 'Machinery & Vehicle' });
    const { service, categoryFindUnique: cfu } = makeService({
      expenseAggregate,
      expenseGroupBy,
      categoryFindUnique,
    });

    const summary = await service.summary();

    expect(summary.totalThisMonth).toBe(186400);
    expect(summary.totalThisWeek).toBe(63700);
    // Largest by summed amount is the machinery bucket.
    expect(cfu).toHaveBeenCalledWith({ where: { id: 'catMachinery' } });
    expect(summary.largestCategoryThisMonth).toEqual({
      name: 'Machinery & Vehicle',
      total: 120000,
    });
  });

  it('returns zeros and a null largest-category when there are no Expenses', async () => {
    const expenseAggregate = vi
      .fn()
      .mockResolvedValue({ _sum: { amount: null } });
    const expenseGroupBy = vi.fn().mockResolvedValue([]);
    const { service, categoryFindUnique } = makeService({
      expenseAggregate,
      expenseGroupBy,
    });

    const summary = await service.summary();

    expect(summary).toEqual({
      totalThisMonth: 0,
      totalThisWeek: 0,
      largestCategoryThisMonth: null,
    });
    expect(categoryFindUnique).not.toHaveBeenCalled();
  });
});

describe('ExpensesService.searchCandidates', () => {
  it('matches description/personOrVendor, excludes superseded-DSR rows the same way list() does, capped at 200', async () => {
    const expenseFindMany = vi.fn().mockResolvedValue([{ id: 'x1' }]);
    const expenseCount = vi.fn().mockResolvedValue(1);
    const { service } = makeService({ expenseFindMany, expenseCount });

    const result = await service.searchCandidates('diesel', []);

    const expectedWhere = {
      OR: [{ dailySiteReportId: null }, { dailySiteReportId: { notIn: [] } }],
      AND: [
        {
          OR: [
            { description: { contains: 'diesel', mode: 'insensitive' } },
            { personOrVendor: { contains: 'diesel', mode: 'insensitive' } },
          ],
        },
      ],
    };
    expect(expenseFindMany).toHaveBeenCalledWith({
      where: expectedWhere,
      include: { site: true, category: true },
      orderBy: { incurredAt: 'desc' },
      take: 200,
    });
    expect(expenseCount).toHaveBeenCalledWith({ where: expectedWhere });
    expect(result).toEqual({ candidates: [{ id: 'x1' }], total: 1 });
  });
});
