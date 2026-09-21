import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

function makeService(overrides: {
  attendanceFindMany?: ReturnType<typeof vi.fn>;
  paymentCreate?: ReturnType<typeof vi.fn>;
  paymentFindUnique?: ReturnType<typeof vi.fn>;
  advanceFindUniqueOrThrow?: ReturnType<typeof vi.fn>;
  adjustmentCreate?: ReturnType<typeof vi.fn>;
  labourerUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  // First call = supersededAttendanceIds' own lookup (always none in these
  // tests, so it's fine to reuse the same mock unless a test needs both
  // calls distinguished).
  const attendanceFindMany =
    overrides.attendanceFindMany ?? vi.fn().mockResolvedValue([]);
  const paymentCreate =
    overrides.paymentCreate ??
    vi.fn().mockImplementation(({ data }: { data: unknown }) =>
      Promise.resolve({
        id: 'pay1',
        createdAt: new Date('2026-08-17'),
        ...(data as object),
      }),
    );
  const paymentFindUnique =
    overrides.paymentFindUnique ?? vi.fn().mockResolvedValue(null);
  const advanceFindUniqueOrThrow =
    overrides.advanceFindUniqueOrThrow ??
    vi.fn().mockResolvedValue({ id: 'adv1', labourerId: 'l1' });
  const adjustmentCreate =
    overrides.adjustmentCreate ?? vi.fn().mockResolvedValue({ id: 'adj1' });
  const labourerUpdateMany =
    overrides.labourerUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    dailyLabourWeeklyPayment: { create: paymentCreate },
    dailyLabourAdvance: { findUniqueOrThrow: advanceFindUniqueOrThrow },
    dailyLabourAdvanceAdjustment: { create: adjustmentCreate },
    dailyLabourer: { updateMany: labourerUpdateMany },
  };

  const prisma = {
    dailyLabourAttendance: { findMany: attendanceFindMany },
    dailyLabourWeeklyPayment: { findUnique: paymentFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new DailyLabourWeeklyPaymentsService(
    prisma as unknown as ConstructorParameters<
      typeof DailyLabourWeeklyPaymentsService
    >[0],
  );

  return {
    service,
    prisma,
    attendanceFindMany,
    paymentCreate,
    adjustmentCreate,
    labourerUpdateMany,
  };
}

const decimal = (n: number) => ({ toNumber: () => n });

const baseInput = {
  labourerId: 'l1',
  weekStartDate: '2026-08-10', // a Monday
  amountPaid: 2400,
  status: 'PAID' as const,
};

describe('DailyLabourWeeklyPaymentsService.create', () => {
  it('sums only attended, current-version attendance rows for the week into totalEarned', async () => {
    const attendanceFindMany = vi
      .fn()
      .mockResolvedValueOnce([]) // supersededAttendanceIds' own lookup
      .mockResolvedValueOnce([
        { perDayAmount: decimal(800) },
        { perDayAmount: decimal(800) },
        { perDayAmount: decimal(800) },
      ]);
    const { service, paymentCreate } = makeService({ attendanceFindMany });

    await service.create(baseInput);

    expect(paymentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ totalEarned: 2400 }),
    });
  });

  it('computes weekEndDate as six days after weekStartDate', async () => {
    const { service, paymentCreate } = makeService({});

    await service.create(baseInput);

    const call = paymentCreate.mock.calls[0]?.[0] as {
      data: { weekEndDate: Date };
    };
    expect(call.data.weekEndDate.toISOString().slice(0, 10)).toBe('2026-08-16');
  });

  it('creates a linked AdvanceAdjustment and decrements the balance by its full amount on a fresh payment', async () => {
    const { service, adjustmentCreate, labourerUpdateMany } = makeService({});

    await service.create({
      ...baseInput,
      advanceAdjustment: {
        advanceId: 'adv1',
        amount: 300,
        note: 'Partial repay',
      },
    });

    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: 300 } },
      data: { outstandingAdvanceBalance: { decrement: 300 } },
    });
    expect(adjustmentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        advanceId: 'adv1',
        paymentId: 'pay1',
        amount: 300,
      }),
    });
  });

  it('rejects when the linked Advance belongs to a different Labourer', async () => {
    const advanceFindUniqueOrThrow = vi
      .fn()
      .mockResolvedValue({ id: 'adv1', labourerId: 'someone-else' });
    const { service } = makeService({ advanceFindUniqueOrThrow });

    await expect(
      service.create({
        ...baseInput,
        advanceAdjustment: { advanceId: 'adv1', amount: 300 },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a weekStartDate that is not a Monday at the schema level (documented via a direct service call bypassing validation still computes weekEndDate correctly)', async () => {
    // The Monday check lives in the Zod schema (createDailyLabourWeeklyPaymentSchema),
    // not the service — this test just documents that the service itself
    // trusts whatever weekStartDate it's given once past validation.
    const { service, paymentCreate } = makeService({});

    await service.create({ ...baseInput, weekStartDate: '2026-08-11' });

    const call = paymentCreate.mock.calls[0]?.[0] as {
      data: { weekEndDate: Date };
    };
    expect(call.data.weekEndDate.toISOString().slice(0, 10)).toBe('2026-08-17');
  });

  it('rejects a correctsId that does not reference an existing Weekly Payment', async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ paymentFindUnique });

    await expect(
      service.create({ ...baseInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a correction that restates a different week than the one it corrects', async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      labourerId: 'l1',
      weekStartDate: new Date('2026-08-03'),
      advanceAdjustments: [],
    });
    const { service } = makeService({ paymentFindUnique });

    await expect(
      service.create({ ...baseInput, correctsId: 'orig', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('applies only the delta when a correction changes the linked Adjustment amount', async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      labourerId: 'l1',
      weekStartDate: new Date('2026-08-10'),
      advanceAdjustments: [
        { id: 'adj-orig', advanceId: 'adv1', amount: decimal(300) },
      ],
    });
    const { service, labourerUpdateMany } = makeService({ paymentFindUnique });

    await service.create({
      ...baseInput,
      correctsId: 'orig',
      reason: 'Recount',
      advanceAdjustment: { advanceId: 'adv1', amount: 500 },
    });

    // delta = 500 - 300 = 200
    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: 200 } },
      data: { outstandingAdvanceBalance: { decrement: 200 } },
    });
  });

  it('reverses the previously-linked Adjustment when a correction drops it entirely', async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      labourerId: 'l1',
      weekStartDate: new Date('2026-08-10'),
      advanceAdjustments: [
        { id: 'adj-orig', advanceId: 'adv1', amount: decimal(300) },
      ],
    });
    const { service, labourerUpdateMany, adjustmentCreate } = makeService({
      paymentFindUnique,
    });

    await service.create({
      ...baseInput,
      correctsId: 'orig',
      reason: 'No advance taken after all',
    });

    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: -300 } },
      data: { outstandingAdvanceBalance: { decrement: -300 } },
    });
    expect(adjustmentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        advanceId: 'adv1',
        amount: -300,
        correctsId: 'adj-orig',
      }),
    });
  });
});

describe('DailyLabourWeeklyPaymentsService.findOne', () => {
  it('throws NotFoundException when no Weekly Payment matches the id', async () => {
    const prisma = {
      dailyLabourWeeklyPayment: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new DailyLabourWeeklyPaymentsService(
      prisma as unknown as ConstructorParameters<
        typeof DailyLabourWeeklyPaymentsService
      >[0],
    );

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
