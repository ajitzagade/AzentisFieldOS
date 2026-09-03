import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { WorkEntriesService } from './work-entries.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
  updateMany?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  findUniqueEntry?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const create = overrides.create ?? vi.fn();
  const updateMany =
    overrides.updateMany ?? vi.fn().mockResolvedValue({ count: 1 });
  const findMany = overrides.findMany ?? vi.fn();
  const findUniqueEntry = overrides.findUniqueEntry ?? vi.fn();

  const tx: {
    subcontractorWorkEntry: { create: typeof create };
    siteContract: { updateMany: typeof updateMany };
  } = {
    subcontractorWorkEntry: { create },
    siteContract: { updateMany },
  };
  const prisma = {
    siteContract: { findUnique },
    subcontractorWorkEntry: { findMany, findUnique: findUniqueEntry },
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
  subcontractor: { id: 'sc1', deletedAt: null },
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
      findUniqueEntry: vi
        .fn()
        .mockResolvedValue({ id: 'we1', siteContractId: 'c1' }),
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

  it('accepts a same-magnitude negative correction that stays at/above zero', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'we2', quantity: -10 });
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(ACTIVE_PER_PIPE_CONTRACT),
      create,
      updateMany,
      findUniqueEntry: vi
        .fn()
        .mockResolvedValue({ id: 'we1', siteContractId: 'c1' }),
    });

    const result = await service.create(
      {
        siteContractId: 'c1',
        quantity: -10,
        workDate: new Date(),
        correctsId: 'we1',
        reason: 'over-counted',
      },
      'u1',
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'c1', quantityCompleted: { gte: 10 } },
      data: { quantityCompleted: { increment: -10 } },
    });
    expect(result).toEqual({ id: 'we2', quantity: -10 });
  });

  it("rejects when the target Site Contract's parent Subcontractor is soft-deleted", async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue({
        ...ACTIVE_PER_PIPE_CONTRACT,
        subcontractor: { id: 'sc1', deletedAt: new Date() },
      }),
    });

    await expect(
      service.create(
        { siteContractId: 'c1', quantity: 10, workDate: new Date() },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a correctsId that does not reference an existing Work Entry', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(ACTIVE_PER_PIPE_CONTRACT),
      findUniqueEntry: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.create(
        {
          siteContractId: 'c1',
          quantity: -5,
          workDate: new Date(),
          correctsId: 'missing-entry',
          reason: 'typo',
        },
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a correctsId that belongs to a different Site Contract', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(ACTIVE_PER_PIPE_CONTRACT),
      findUniqueEntry: vi
        .fn()
        .mockResolvedValue({ id: 'we1', siteContractId: 'other-contract' }),
    });

    await expect(
      service.create(
        {
          siteContractId: 'c1',
          quantity: -5,
          workDate: new Date(),
          correctsId: 'we1',
          reason: 'typo',
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

describe('WorkEntriesService.searchCandidates', () => {
  it("matches the linked Site Contract's Subcontractor/Site name and the free-text note, case-insensitively", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { subcontractorWorkEntry: { findMany, count } };
    const service = new WorkEntriesService(
      prisma as unknown as ConstructorParameters<typeof WorkEntriesService>[0],
    );

    await service.searchCandidates('universal');

    const expectedWhere = {
      OR: [
        {
          siteContract: {
            subcontractor: {
              name: { contains: 'universal', mode: 'insensitive' },
            },
          },
        },
        {
          siteContract: {
            site: { name: { contains: 'universal', mode: 'insensitive' } },
          },
        },
        { note: { contains: 'universal', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
