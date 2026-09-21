import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DailyLabourAdvancesService } from './daily-labour-advances.service';

function makeService(overrides: {
  advanceCreate?: ReturnType<typeof vi.fn>;
  advanceFindUnique?: ReturnType<typeof vi.fn>;
  labourerUpdateMany?: ReturnType<typeof vi.fn>;
}) {
  const advanceCreate =
    overrides.advanceCreate ?? vi.fn().mockResolvedValue({ id: 'a1' });
  const advanceFindUnique = overrides.advanceFindUnique ?? vi.fn();
  const labourerUpdateMany =
    overrides.labourerUpdateMany ?? vi.fn().mockResolvedValue({ count: 1 });

  const tx = {
    dailyLabourAdvance: {
      create: advanceCreate,
      findUnique: advanceFindUnique,
    },
    dailyLabourer: { updateMany: labourerUpdateMany },
  };

  const prisma = {
    dailyLabourAdvance: { findUnique: advanceFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new DailyLabourAdvancesService(
    prisma as unknown as ConstructorParameters<
      typeof DailyLabourAdvancesService
    >[0],
  );

  return { service, prisma, advanceCreate, labourerUpdateMany };
}

const createInput = {
  labourerId: 'l1',
  amount: 1000,
  givenAt: '2026-08-13',
};

describe('DailyLabourAdvancesService.create', () => {
  it('increments DailyLabourer.outstandingAdvanceBalance by exactly amount, inside the same transaction as the Advance insert', async () => {
    const { service, prisma, labourerUpdateMany } = makeService({});

    await service.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: -1000 } },
      data: { outstandingAdvanceBalance: { decrement: -1000 } },
    });
  });

  it('rejects when the floor-check fails (defensive — should never happen for a fresh Advance)', async () => {
    const labourerUpdateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({ labourerUpdateMany });

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

  it("rejects a correction whose labourerId doesn't match the original Advance", async () => {
    const advanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'a-different-labourer' });
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
    const advanceFindUnique = vi
      .fn()
      .mockResolvedValue({ id: 'orig', labourerId: 'l1' });
    const { service, labourerUpdateMany } = makeService({ advanceFindUnique });

    await service.create({
      ...createInput,
      amount: -400,
      correctsId: 'orig',
      correctionReason: 'Recorded in error',
    });

    expect(labourerUpdateMany).toHaveBeenCalledWith({
      where: { id: 'l1', outstandingAdvanceBalance: { gte: 400 } },
      data: { outstandingAdvanceBalance: { decrement: 400 } },
    });
  });
});

describe('DailyLabourAdvancesService.findOne', () => {
  it('throws NotFoundException when no Advance matches the id', async () => {
    const prisma = {
      dailyLabourAdvance: { findUnique: vi.fn().mockResolvedValue(null) },
    };
    const service = new DailyLabourAdvancesService(
      prisma as unknown as ConstructorParameters<
        typeof DailyLabourAdvancesService
      >[0],
    );

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
