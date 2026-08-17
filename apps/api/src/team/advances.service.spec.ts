import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdvancesService } from './advances.service';

function makeService(overrides: {
  advanceCreate?: ReturnType<typeof vi.fn>;
  advanceFindUnique?: ReturnType<typeof vi.fn>;
  teamMemberUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const advanceCreate =
    overrides.advanceCreate ?? vi.fn().mockResolvedValue({ id: 'a1' });
  const advanceFindUnique = overrides.advanceFindUnique ?? vi.fn();
  const teamMemberUpdateMany =
    overrides.teamMemberUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    advance: { create: advanceCreate },
    teamMember: { updateMany: teamMemberUpdateMany },
  };

  const prisma = {
    advance: { findUnique: advanceFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new AdvancesService(
    prisma as unknown as ConstructorParameters<typeof AdvancesService>[0],
  );

  return { service, prisma, advanceCreate, teamMemberUpdateMany };
}

const createInput = {
  teamMemberId: 'tm1',
  amount: 5000,
  givenAt: new Date('2026-08-13'),
};

describe('AdvancesService.create', () => {
  it('increments TeamMember.outstandingAdvanceBalance by exactly amount, inside the same transaction as the Advance insert', async () => {
    const { service, prisma, teamMemberUpdateMany } = makeService({});

    await service.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: -5000 } },
      data: { outstandingAdvanceBalance: { decrement: -5000 } },
    });
  });

  it('rejects a positive Advance whose increment would somehow fail the floor check (defensive — should never happen for a fresh Advance)', async () => {
    const teamMemberUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({ teamMemberUpdateMany });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a correctsId that does not reference an existing Advance', async () => {
    const advanceFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ advanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'missing',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose teamMemberId doesn't match the original Advance — it would apply the delta to the wrong person's balance", async () => {
    const advanceFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      teamMemberId: 'a-different-team-member',
    });
    const { service } = makeService({ advanceFindUnique });

    await expect(
      service.create({
        ...createInput,
        correctsId: 'orig',
        correctionReason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('decrements the balance for a correction with a negative amount', async () => {
    const advanceFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      teamMemberId: 'tm1',
    });
    const { service, teamMemberUpdateMany } = makeService({
      advanceFindUnique,
    });

    await service.create({
      ...createInput,
      amount: -2000,
      correctsId: 'orig',
      correctionReason: 'Recorded in error',
    });

    expect(teamMemberUpdateMany).toHaveBeenCalledWith({
      where: { id: 'tm1', outstandingAdvanceBalance: { gte: 2000 } },
      data: { outstandingAdvanceBalance: { decrement: 2000 } },
    });
  });

  it('rejects a negative-amount correction that would drive the Outstanding Balance below zero', async () => {
    const advanceFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      teamMemberId: 'tm1',
    });
    const teamMemberUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      advanceFindUnique,
      teamMemberUpdateMany,
    });

    await expect(
      service.create({
        ...createInput,
        amount: -20000,
        correctsId: 'orig',
        correctionReason: 'Recorded in error',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('AdvancesService.findOne', () => {
  function makeFindOneService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = { advance: { findUnique } };
    return new AdvancesService(
      prisma as unknown as ConstructorParameters<typeof AdvancesService>[0],
    );
  }

  it('throws NotFoundException when no Advance matches the id', async () => {
    const service = makeFindOneService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
