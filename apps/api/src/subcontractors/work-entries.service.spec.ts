import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { WorkEntriesService } from './work-entries.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
  updateMany?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const create = overrides.create ?? vi.fn();
  const updateMany =
    overrides.updateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const findMany = overrides.findMany ?? vi.fn();

  const tx: {
    subcontractorWorkEntry: { create: typeof create };
    siteContract: { updateMany: typeof updateMany };
  } = {
    subcontractorWorkEntry: { create },
    siteContract: { updateMany },
  };
  const prisma = {
    siteContract: { findUnique },
    subcontractorWorkEntry: { findMany },
    $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
  };

  const service = new WorkEntriesService(
    prisma as unknown as ConstructorParameters<typeof WorkEntriesService>[0],
  );
  return { service, prisma, tx };
}

const ACTIVE_PER_PIPE_CONTRACT = {
  id: 'c1',
  status: 'ACTIVE',
  rateType: 'PER_PIPE',
};

describe('WorkEntriesService.create', () => {
  it('rejects when the target Site Contract does not exist', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.create(
        {
          siteContractId: 'missing',
          quantity: 10,
          workDate: new Date(),
        },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects when the contract is Draft, not Active', async () => {
    const { service } = makeService({
      findUnique: vi
        .fn()
        .mockResolvedValue({ ...ACTIVE_PER_PIPE_CONTRACT, status: 'DRAFT' }),
    });

    await expect(
      service.create(
        { siteContractId: 'c1', quantity: 10, workDate: new Date() },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects when the contract is Fixed Cost — no billable quantity to track', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue({
        ...ACTIVE_PER_PIPE_CONTRACT,
        rateType: 'FIXED_COST',
      }),
    });

    await expect(
      service.create(
        { siteContractId: 'c1', quantity: 10, workDate: new Date() },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates the entry and increments quantityCompleted atomically for a valid Active, non-Fixed-Cost contract', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'we1', quantity: 10 });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(ACTIVE_PER_PIPE_CONTRACT),
      create,
      updateMany,
    });

    const result = await service.create(
      { siteContractId: 'c1', quantity: 10, workDate: new Date() },
      'u1',
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        siteContractId: 'c1',
        quantity: 10,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        workDate: expect.any(Date),
        recordedByUserId: 'u1',
      },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'c1', quantityCompleted: { gte: -10 } },
      data: { quantityCompleted: { increment: 10 } },
    });
    expect(result).toEqual({ id: 'we1', quantity: 10 });
  });

  it('rejects a reducing correction that would drive quantityCompleted below zero', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(ACTIVE_PER_PIPE_CONTRACT),
      updateMany,
    });

    await expect(
      service.create(
        {
          siteContractId: 'c1',
          quantity: -500,
          workDate: new Date(),
          correctsId: 'we1',
          reason: 'over-counted',
        },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('WorkEntriesService.list', () => {
  it('filters by siteContractId when given', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ siteContractId: 'c1' });

    expect(findMany).toHaveBeenCalledWith({
      where: { siteContractId: 'c1' },
      orderBy: { workDate: 'desc' },
    });
  });
});
