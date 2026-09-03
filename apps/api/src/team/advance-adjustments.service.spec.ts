import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdvanceAdjustmentsService } from './advance-adjustments.service';

function makeService(overrides: {
  advanceFindUniqueOrThrow?: ReturnType<typeof vi.fn>;
  teamMemberUpdateMany?: ReturnType<typeof vi.fn>;
  advanceAdjustmentCreate?: ReturnType<typeof vi.fn>;
  advanceAdjustmentFindUnique?: ReturnType<typeof vi.fn>;
}) {
  const advanceFindUniqueOrThrow =
    overrides.advanceFindUniqueOrThrow ??
    vi.fn().mockResolvedValue({ id: 'adv1', teamMemberId: 'tm1' });
  const teamMemberUpdateMany =
    overrides.teamMemberUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const advanceAdjustmentCreate =
    overrides.advanceAdjustmentCreate ??
    vi.fn().mockResolvedValue({ id: 'aa1' });
  const advanceAdjustmentFindUnique =
    overrides.advanceAdjustmentFindUnique ?? vi.fn();

  const tx = {
    advance: { findUniqueOrThrow: advanceFindUniqueOrThrow },
    teamMember: { updateMany: teamMemberUpdateMany },
    advanceAdjustment: { create: advanceAdjustmentCreate },
  };

  const prisma = {
    advanceAdjustment: { findUnique: advanceAdjustmentFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new AdvanceAdjustmentsService(
    prisma as unknown as ConstructorParameters<
      typeof AdvanceAdjustmentsService
    >[0],
  );

  return {
    service,
    prisma,
    advanceFindUniqueOrThrow,
    teamMemberUpdateMany,
    advanceAdjustmentCreate,
  };
}

const createInput = {
  advanceId: 'adv1',
  amount: 3000,
  adjustedAt: new Date('2026-08-13'),
};

describe('AdvanceAdjustmentsService.create', () => {
  it('decrements TeamMember.outstandingAdvanceBalance by exactly amount when within balance, inside the same transaction as the AdvanceAdjustment insert', async () => {
    const { service, prisma, teamMemberUpdateMany, advanceAdjustmentCreate } =
      makeService({});

    await service.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: 3000 } },
      data: { outstandingAdvanceBalance: { decrement: 3000 } },
    });
    expect(advanceAdjustmentCreate).toHaveBeenCalledWith({ data: createInput });
  });

  it('rejects with ADJUSTMENT_EXCEEDS_BALANCE and never writes an AdvanceAdjustment row when the amount exceeds the current balance (count 0)', async () => {
    const teamMemberUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const advanceAdjustmentCreate = vi.fn();
    const { service, prisma } = makeService({
      teamMemberUpdateMany,
      advanceAdjustmentCreate,
    });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(advanceAdjustmentCreate).not.toHaveBeenCalled();
  });

  it('always succeeds for a negative-amount correction regardless of the current balance', async () => {
    const advanceFindUniqueOrThrow = vi
      .fn()
      .mockResolvedValue({ id: 'orig-adv', teamMemberId: 'tm1' });
    const advanceAdjustmentFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'aa-orig', advanceId: 'orig-adv' });
    const { service, teamMemberUpdateMany } = makeService({
      advanceFindUniqueOrThrow,
      advanceAdjustmentFindUnique,
    });

    await service.create({
      advanceId: 'orig-adv',
      amount: -1000,
      adjustedAt: new Date('2026-08-13'),
      correctsId: 'aa-orig',
      correctionReason: 'Recorded in error',
    });

    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: -1000 } },
      data: { outstandingAdvanceBalance: { decrement: -1000 } },
    });
  });

  it('rejects a correctsId that does not reference an existing AdvanceAdjustment', async () => {
    const advanceAdjustmentFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ advanceAdjustmentFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'missing',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose advanceId doesn't match the original AdvanceAdjustment", async () => {
    const advanceAdjustmentFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      advanceId: 'a-different-advance',
    });
    const { service } = makeService({ advanceAdjustmentFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'orig',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('AdvanceAdjustmentsService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { advanceAdjustment: { findUnique } };
    return new AdvanceAdjustmentsService(
      prisma as unknown as ConstructorParameters<
        typeof AdvanceAdjustmentsService
      >[0],
    );
  }

  it('throws NotFoundException when no AdvanceAdjustment matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('AdvanceAdjustmentsService.searchCandidates', () => {
  it("matches the parent Advance's Team Member name and the free-text note, case-insensitively", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { advanceAdjustment: { findMany, count } };
    const service = new AdvanceAdjustmentsService(
      prisma as unknown as ConstructorParameters<
        typeof AdvanceAdjustmentsService
      >[0],
    );

    await service.searchCandidates('ravi');

    const expectedWhere = {
      OR: [
        {
          advance: {
            teamMember: { name: { contains: 'ravi', mode: 'insensitive' } },
          },
        },
        { note: { contains: 'ravi', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
