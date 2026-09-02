import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { SubcontractorPaymentsService } from './subcontractor-payments.service';

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
    subcontractorPayment: { create: typeof create };
    siteContract: { updateMany: typeof updateMany };
  } = {
    subcontractorPayment: { create },
    siteContract: { updateMany },
  };
  const prisma = {
    siteContract: { findUnique },
    subcontractorPayment: { findMany },
    $transaction: vi.fn((fn: (client: typeof tx) => unknown) => fn(tx)),
  };

  const service = new SubcontractorPaymentsService(
    prisma as unknown as ConstructorParameters<
      typeof SubcontractorPaymentsService
    >[0],
  );
  return { service, prisma, tx };
}

const DRAFT_CONTRACT = { id: 'c1', status: 'DRAFT', rateType: null };

describe('SubcontractorPaymentsService.create', () => {
  it('rejects when the target Site Contract does not exist', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.create(
        {
          siteContractId: 'missing',
          type: 'ADVANCE',
          amount: 5000,
          paidAt: new Date(),
        } as never,
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepts a Payment/Advance against a Draft contract — no status restriction, unlike Work Entries', async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ id: 'p1', amount: 50000, type: 'ADVANCE' });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DRAFT_CONTRACT),
      create,
    });

    const result = await service.create(
      {
        siteContractId: 'c1',
        type: 'ADVANCE',
        amount: 50000,
        paidAt: new Date(),
      } as never,
      'u1',
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        siteContractId: 'c1',
        type: 'ADVANCE',
        amount: 50000,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- vitest asymmetric matcher
        paidAt: expect.any(Date),
        recordedByUserId: 'u1',
      },
    });
    expect(result).toEqual({ id: 'p1', amount: 50000, type: 'ADVANCE' });
  });

  it('accepts an amount that exceeds the current payable — no ceiling (AC #2)', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DRAFT_CONTRACT),
      updateMany,
    });

    await service.create(
      {
        siteContractId: 'c1',
        type: 'ADVANCE',
        amount: 10_00_000,
        paidAt: new Date(),
      } as never,
      'u1',
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'c1', amountPaid: { gte: -10_00_000 } },
      data: { amountPaid: { increment: 10_00_000 } },
    });
  });

  it('rejects a reducing correction that would drive amountPaid below zero', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(DRAFT_CONTRACT),
      updateMany,
    });

    await expect(
      service.create(
        {
          siteContractId: 'c1',
          type: 'ADVANCE',
          amount: -100000,
          paidAt: new Date(),
          correctsId: 'p1',
          reason: 'over-recorded',
        } as never,
        'u1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('type is a display label only — both ADVANCE and PAYMENT increment amountPaid identically', async () => {
    const updateManyAdvance = vi.fn().mockResolvedValue({ count: 1 });
    const { service: advanceService } = makeService({
      findUnique: vi.fn().mockResolvedValue(DRAFT_CONTRACT),
      updateMany: updateManyAdvance,
    });
    await advanceService.create(
      {
        siteContractId: 'c1',
        type: 'ADVANCE',
        amount: 1000,
        paidAt: new Date(),
      } as never,
      'u1',
    );

    const updateManyPayment = vi.fn().mockResolvedValue({ count: 1 });
    const { service: paymentService } = makeService({
      findUnique: vi.fn().mockResolvedValue(DRAFT_CONTRACT),
      updateMany: updateManyPayment,
    });
    await paymentService.create(
      {
        siteContractId: 'c1',
        type: 'PAYMENT',
        amount: 1000,
        paidAt: new Date(),
      } as never,
      'u1',
    );

    expect(updateManyAdvance).toHaveBeenCalledWith(
      expect.objectContaining({ data: { amountPaid: { increment: 1000 } } }),
    );
    expect(updateManyPayment).toHaveBeenCalledWith(
      expect.objectContaining({ data: { amountPaid: { increment: 1000 } } }),
    );
  });
});

describe('SubcontractorPaymentsService.list', () => {
  it('filters by siteContractId when given', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ siteContractId: 'c1' });

    expect(findMany).toHaveBeenCalledWith({
      where: { siteContractId: 'c1' },
      orderBy: { paidAt: 'desc' },
    });
  });
});
