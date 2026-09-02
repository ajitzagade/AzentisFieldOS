import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PaymentsService } from './payments.service';

function makeService(overrides: {
  paymentCreate?: ReturnType<typeof vi.fn>;
  paymentFindUnique?: ReturnType<typeof vi.fn>;
  advanceFindUniqueOrThrow?: ReturnType<typeof vi.fn>;
  teamMemberUpdateMany?: ReturnType<typeof vi.fn>;
  advanceAdjustmentCreate?: ReturnType<typeof vi.fn>;
}) {
  const paymentCreate =
    overrides.paymentCreate ??
    vi.fn().mockResolvedValue({ id: 'p1', createdAt: new Date('2026-08-13') });
  const paymentFindUnique = overrides.paymentFindUnique ?? vi.fn();
  const advanceFindUniqueOrThrow =
    overrides.advanceFindUniqueOrThrow ??
    vi.fn().mockResolvedValue({ id: 'adv1', teamMemberId: 'tm1' });
  const teamMemberUpdateMany =
    overrides.teamMemberUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const advanceAdjustmentCreate =
    overrides.advanceAdjustmentCreate ??
    vi.fn().mockResolvedValue({ id: 'aa1' });

  const tx = {
    payment: { create: paymentCreate },
    advance: { findUniqueOrThrow: advanceFindUniqueOrThrow },
    teamMember: { updateMany: teamMemberUpdateMany },
    advanceAdjustment: { create: advanceAdjustmentCreate },
  };

  const prisma = {
    payment: { findUnique: paymentFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new PaymentsService(
    prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
  );

  return {
    service,
    prisma,
    paymentCreate,
    advanceFindUniqueOrThrow,
    teamMemberUpdateMany,
    advanceAdjustmentCreate,
  };
}

const baseInput = {
  teamMemberId: 'tm1',
  basePay: 15000,
  additionalAmount: 2000,
  deductions: 500,
};

describe('PaymentsService.create — netPayable computation (AC #1, #3)', () => {
  it('computes netPayable as basePay + additionalAmount - deductions when no Advance Adjustment is linked', async () => {
    const { service, paymentCreate } = makeService({});

    await service.create(baseInput);

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ netPayable: 16500 }),
      }),
    );
  });

  it('computes netPayable as basePay + additionalAmount - deductions - advanceAdjustment.amount when one is linked', async () => {
    const { service, paymentCreate } = makeService({});

    await service.create({
      ...baseInput,
      advanceAdjustment: { advanceId: 'adv1', amount: 3000 },
    });

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ netPayable: 13500 }),
      }),
    );
  });

  it('computes netPayable correctly when additionalAmount and deductions are both zero', async () => {
    const { service, paymentCreate } = makeService({});

    await service.create({
      teamMemberId: 'tm1',
      basePay: 10000,
      additionalAmount: 0,
      deductions: 0,
    });

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ netPayable: 10000 }),
      }),
    );
  });

  it('inserts the Payment with status pending and paidAt null', async () => {
    const { service, paymentCreate } = makeService({});

    await service.create(baseInput);

    expect(paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'pending', paidAt: null }),
      }),
    );
  });
});

describe('PaymentsService.create — linked Advance Adjustment (AC #4)', () => {
  it('applies the cap check and decrements the balance, then inserts the AdvanceAdjustment with paymentId set to the new Payment', async () => {
    const { service, teamMemberUpdateMany, advanceAdjustmentCreate } =
      makeService({});

    await service.create({
      ...baseInput,
      advanceAdjustment: {
        advanceId: 'adv1',
        amount: 3000,
        note: 'Adjusted against this payment',
      },
    });

    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: 3000 } },
      data: { outstandingAdvanceBalance: { decrement: 3000 } },
    });
    expect(advanceAdjustmentCreate).toHaveBeenCalledWith({
      data: {
        advanceId: 'adv1',
        paymentId: 'p1',
        amount: 3000,
        note: 'Adjusted against this payment',
        adjustedAt: new Date('2026-08-13'),
      },
    });
  });

  it('rejects with ADJUSTMENT_EXCEEDS_BALANCE and never writes an AdvanceAdjustment row when the linked amount exceeds the current balance (whole-transaction rollback)', async () => {
    const teamMemberUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const advanceAdjustmentCreate = vi.fn();
    const paymentCreate = vi
      .fn()
      .mockResolvedValue({ id: 'p1', createdAt: new Date() });
    const { service, prisma } = makeService({
      teamMemberUpdateMany,
      advanceAdjustmentCreate,
      paymentCreate,
    });

    await expect(
      service.create({
        ...baseInput,
        advanceAdjustment: { advanceId: 'adv1', amount: 9000 },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(advanceAdjustmentCreate).not.toHaveBeenCalled();
  });

  it('omits the Advance Adjustment step entirely when none is linked (AC #3 — no warning, no side effect)', async () => {
    const {
      service,
      advanceFindUniqueOrThrow,
      teamMemberUpdateMany,
      advanceAdjustmentCreate,
    } = makeService({});

    await service.create(baseInput);

    expect(advanceFindUniqueOrThrow).not.toHaveBeenCalled();
    expect(teamMemberUpdateMany).not.toHaveBeenCalled();
    expect(advanceAdjustmentCreate).not.toHaveBeenCalled();
  });

  it("rejects when the linked Advance doesn't belong to the Payment's own Team Member, without decrementing anyone's balance", async () => {
    const advanceFindUniqueOrThrow = vi.fn().mockResolvedValue({
      id: 'adv1',
      teamMemberId: 'a-different-team-member',
    });
    const teamMemberUpdateMany = vi.fn();
    const { service } = makeService({
      advanceFindUniqueOrThrow,
      teamMemberUpdateMany,
    });

    await expect(
      service.create({
        ...baseInput,
        advanceAdjustment: { advanceId: 'adv1', amount: 3000 },
      }),
    ).rejects.toThrow(BadRequestException);
    expect(teamMemberUpdateMany).not.toHaveBeenCalled();
  });
});

describe('PaymentsService.create — correcting a Payment that had a linked Advance Adjustment', () => {
  function makeCorrectionService(overrides: {
    originalAdjustment?: {
      id: string;
      advanceId: string;
      amount: { toNumber: () => number };
    } | null;
    teamMemberUpdateMany?: ReturnType<typeof vi.fn>;
    advanceAdjustmentCreate?: ReturnType<typeof vi.fn>;
  }) {
    const originalAdjustment =
      overrides.originalAdjustment === undefined
        ? { id: 'aa-orig', advanceId: 'adv1', amount: { toNumber: () => 3000 } }
        : overrides.originalAdjustment;
    const paymentFindUnique = vi.fn().mockResolvedValue({
      id: 'p-orig',
      teamMemberId: 'tm1',
      advanceAdjustments: originalAdjustment ? [originalAdjustment] : [],
    });
    return makeService({
      paymentFindUnique,
      teamMemberUpdateMany: overrides.teamMemberUpdateMany,
      advanceAdjustmentCreate: overrides.advanceAdjustmentCreate,
    });
  }

  it('applies only the delta between the previous linked amount and the new one — not the full new amount again — when correcting a Payment whose linked Adjustment amount changed', async () => {
    const { service, teamMemberUpdateMany } = makeCorrectionService({});

    await service.create({
      ...baseInput,
      correctsId: 'p-orig',
      reason: 'Base pay was wrong',
      advanceAdjustment: { advanceId: 'adv1', amount: 4000 },
    });

    // previous linked amount was 3000, new is 4000 — only the 1000 delta
    // should be decremented, not another full 4000 on top of the 3000
    // already taken off by the original Payment.
    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: 1000 } },
      data: { outstandingAdvanceBalance: { decrement: 1000 } },
    });
  });

  it('applies no balance change and skips the floor check when the corrected linked Adjustment amount is unchanged from the original', async () => {
    const { service, teamMemberUpdateMany, advanceAdjustmentCreate } =
      makeCorrectionService({});

    await service.create({
      ...baseInput,
      correctsId: 'p-orig',
      reason: 'Base pay was wrong',
      advanceAdjustment: { advanceId: 'adv1', amount: 3000 },
    });

    expect(teamMemberUpdateMany).not.toHaveBeenCalled();
    expect(advanceAdjustmentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        amount: 3000,
        correctsId: 'aa-orig',
        correctionReason: 'Base pay was wrong',
      }),
    });
  });

  it('gives the balance back and records a reversing AdvanceAdjustment when a correction drops a previously-linked Adjustment entirely', async () => {
    const { service, teamMemberUpdateMany, advanceAdjustmentCreate } =
      makeCorrectionService({});

    await service.create({
      ...baseInput,
      correctsId: 'p-orig',
      reason: 'No longer needs the Adjustment',
    });

    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: -3000 } },
      data: { outstandingAdvanceBalance: { decrement: -3000 } },
    });
    expect(advanceAdjustmentCreate).toHaveBeenCalledWith({
      data: {
        advanceId: 'adv1',
        paymentId: 'p1',
        amount: -3000,
        adjustedAt: new Date('2026-08-13'),
        correctsId: 'aa-orig',
        correctionReason: 'No longer needs the Adjustment',
      },
    });
  });

  it('behaves exactly like a fresh Payment (no delta math, no correctsId on the Adjustment) when the original had no linked Adjustment to begin with', async () => {
    const { service, teamMemberUpdateMany, advanceAdjustmentCreate } =
      makeCorrectionService({ originalAdjustment: null });

    await service.create({
      ...baseInput,
      correctsId: 'p-orig',
      reason: 'Base pay was wrong',
      advanceAdjustment: { advanceId: 'adv1', amount: 3000 },
    });

    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: 3000 } },
      data: { outstandingAdvanceBalance: { decrement: 3000 } },
    });
    expect(advanceAdjustmentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        correctsId: undefined,
        correctionReason: undefined,
      }),
    });
  });
});

describe('PaymentsService.create — corrections', () => {
  it('rejects a correctsId that does not reference an existing Payment', async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ paymentFindUnique });

    await expect(
      service.create({ ...baseInput, correctsId: 'missing', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose teamMemberId doesn't match the original Payment", async () => {
    const paymentFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      teamMemberId: 'a-different-team-member',
    });
    const { service } = makeService({ paymentFindUnique });

    await expect(
      service.create({ ...baseInput, correctsId: 'orig', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('PaymentsService.markPaid', () => {
  function makeMarkPaidService(overrides: {
    updateMany?: ReturnType<typeof vi.fn>;
    findUnique?: ReturnType<typeof vi.fn>;
    findUniqueOrThrow?: ReturnType<typeof vi.fn>;
  }) {
    const updateMany =
      overrides.updateMany ?? vi.fn().mockResolvedValue({ count: 1 });
    const findUnique = overrides.findUnique ?? vi.fn();
    const findUniqueOrThrow =
      overrides.findUniqueOrThrow ??
      vi.fn().mockResolvedValue({ id: 'p1', status: 'paid' });
    const prisma = { payment: { updateMany, findUnique, findUniqueOrThrow } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );
    return { service, updateMany, findUnique };
  }

  it('transitions a pending Payment to paid exactly once, setting paidAt', async () => {
    const { service, updateMany } = makeMarkPaidService({});

    await service.markPaid('p1');

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: 'pending' },
      data: { status: 'paid', paidAt: expect.any(Date) },
    });
  });

  it('rejects a second markPaid call on an already-paid Payment with a 409', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const findUnique = vi.fn().mockResolvedValue({ id: 'p1', status: 'paid' });
    const { service } = makeMarkPaidService({ updateMany, findUnique });

    await expect(service.markPaid('p1')).rejects.toThrow(ConflictException);
  });

  it('rejects markPaid on a Payment id that does not exist with a 404', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const findUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeMarkPaidService({ updateMany, findUnique });

    await expect(service.markPaid('missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('PaymentsService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { payment: { findUnique } };
    return new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );
  }

  it('throws NotFoundException when no Payment matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('PaymentsService.list — search & pagination', () => {
  it('with no query params, calls findMany exactly as today (AC #7)', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { payment: { findMany } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    const result = await service.list();

    expect(Array.isArray(result)).toBe(true);
    expect(findMany).toHaveBeenCalledWith({
      where: { createdAt: undefined },
      include: {
        teamMember: true,
        advanceAdjustments: { include: { advance: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('searches by Team Member name, case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { payment: { findMany } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    await service.list({ q: 'ravi' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          teamMember: { name: { contains: 'ravi', mode: 'insensitive' } },
        }),
      }),
    );
  });

  it('returns a paginated envelope once page/pageSize is requested', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'p1' }]);
    const count = vi.fn().mockResolvedValue(15);
    const prisma = { payment: { findMany, count } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    const result = await service.list({ page: '1', pageSize: '10' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
    expect(result).toEqual({
      rows: [{ id: 'p1' }],
      total: 15,
      page: 1,
      pageSize: 10,
    });
  });

  it('sorts by an allowed field and direction', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { payment: { findMany } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    await service.list({ sort: 'netPayable', order: 'asc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { netPayable: 'asc' } }),
    );
  });

  it('falls back to the default createdAt-desc sort for an unrecognized sort field', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = { payment: { findMany } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    await service.list({ sort: 'id' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });
});

describe('PaymentsService.countPending', () => {
  it('scopes the count to status pending', async () => {
    const count = vi.fn().mockResolvedValue(2);
    const prisma = { payment: { count } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    const result = await service.countPending();

    expect(result).toBe(2);
    expect(count).toHaveBeenCalledWith({ where: { status: 'pending' } });
  });
});

describe('PaymentsService.searchCandidates', () => {
  it("matches on the linked Team Member's name or payPeriod, includes teamMember, capped at 200", async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'pay1' }]);
    const count = vi.fn().mockResolvedValue(1);
    const prisma = { payment: { findMany, count } };
    const service = new PaymentsService(
      prisma as unknown as ConstructorParameters<typeof PaymentsService>[0],
    );

    const result = await service.searchCandidates('ravi');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { teamMember: { name: { contains: 'ravi', mode: 'insensitive' } } },
          { payPeriod: { contains: 'ravi', mode: 'insensitive' } },
        ],
      },
      include: { teamMember: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    expect(count).toHaveBeenCalledWith({
      where: {
        OR: [
          { teamMember: { name: { contains: 'ravi', mode: 'insensitive' } } },
          { payPeriod: { contains: 'ravi', mode: 'insensitive' } },
        ],
      },
    });
    expect(result).toEqual({ candidates: [{ id: 'pay1' }], total: 1 });
  });
});
