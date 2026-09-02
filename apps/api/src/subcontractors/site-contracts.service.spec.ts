import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { SiteContractsService } from './site-contracts.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
  count?: ReturnType<typeof vi.fn>;
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn();
  const create = overrides.create ?? vi.fn();
  const count = overrides.count ?? vi.fn();

  const prisma = {
    siteContract: { findUnique, update, findMany, create, count },
  };
  const service = new SiteContractsService(
    prisma as unknown as ConstructorParameters<typeof SiteContractsService>[0],
  );
  return { service, prisma };
}

const LIVE_DRAFT_MISSING_TERMS = {
  id: 'c1',
  subcontractorId: 'sc1',
  subcontractor: { id: 'sc1', deletedAt: null },
  siteId: 's1',
  site: { id: 's1' },
  workCategory: null,
  rateType: null,
  rate: null,
  fixedAmount: null,
  status: 'DRAFT',
  startDate: null,
  quantityCompleted: new Prisma.Decimal(0),
  amountPaid: new Prisma.Decimal(0),
};

const LIVE_DRAFT_COMPLETE_TERMS = {
  ...LIVE_DRAFT_MISSING_TERMS,
  workCategory: 'Storm-water pipe laying',
  rateType: 'PER_PIPE',
  rate: new Prisma.Decimal(250),
  status: 'DRAFT',
  startDate: new Date('2026-09-08'),
};

describe('SiteContractsService.list', () => {
  it('filters by siteId, subcontractorId, and status together', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({
      siteId: 's1',
      subcontractorId: 'sc1',
      status: 'ACTIVE',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { siteId: 's1', subcontractorId: 'sc1', status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { subcontractor: true, site: true },
    });
  });

  it('returns every Site Contract when no filter is given', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: { subcontractor: true, site: true },
    });
  });
});

describe('SiteContractsService.findOne', () => {
  it('throws NotFoundException for a missing Site Contract', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when the parent Subcontractor is soft-deleted', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue({
        id: 'c1',
        subcontractor: { id: 'sc1', deletedAt: new Date() },
      }),
    });

    await expect(service.findOne('c1')).rejects.toThrow(NotFoundException);
  });
});

describe('SiteContractsService.update — ACTIVE-requires-terms merged check', () => {
  it('rejects a PATCH sending only {status: "ACTIVE"} against a Draft row still missing terms', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_MISSING_TERMS);
    const update = vi.fn();
    const { service } = makeService({ findUnique, update });

    await expect(
      service.update('c1', { status: 'ACTIVE' } as never),
    ).rejects.toThrow(BadRequestException);
    expect(update).not.toHaveBeenCalled();
  });

  it('reports every missing field, not just the first one — but not a separate "rate" issue when rateType itself is unknown', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_MISSING_TERMS);
    const { service } = makeService({ findUnique });

    try {
      await service.update('c1', { status: 'ACTIVE' } as never);
      expect.unreachable();
    } catch (error) {
      const body = (error as BadRequestException).getResponse() as {
        error: { details: { fieldErrors: Record<string, string[]> } };
      };
      // workCategory/rateType/startDate are all unconditionally required;
      // "rate is required" only applies once a rate-based rateType is
      // known, so it correctly does not appear alongside a missing rateType.
      expect(Object.keys(body.error.details.fieldErrors).sort()).toEqual([
        'rateType',
        'startDate',
        'workCategory',
      ]);
    }
  });

  it('separately reports a missing rate once rateType is known to be rate-based', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      ...LIVE_DRAFT_MISSING_TERMS,
      workCategory: 'Storm-water pipe laying',
      rateType: 'PER_PIPE',
      startDate: new Date('2026-09-08'),
    });
    const { service } = makeService({ findUnique });

    try {
      await service.update('c1', { status: 'ACTIVE' } as never);
      expect.unreachable();
    } catch (error) {
      const body = (error as BadRequestException).getResponse() as {
        error: { details: { fieldErrors: Record<string, string[]> } };
      };
      expect(Object.keys(body.error.details.fieldErrors)).toEqual(['rate']);
    }
  });

  it('accepts the same PATCH once the stored row already has every required field filled in', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_COMPLETE_TERMS);
    const update = vi
      .fn()
      .mockResolvedValue({ ...LIVE_DRAFT_COMPLETE_TERMS, status: 'ACTIVE' });
    const { service } = makeService({ findUnique, update });

    const result = await service.update('c1', { status: 'ACTIVE' } as never);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { status: 'ACTIVE' },
    });
    expect(result).toMatchObject({ id: 'c1', status: 'ACTIVE' });
  });

  it('accepts a PATCH that supplies the missing terms in the same request as the status change', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_MISSING_TERMS);
    const update = vi
      .fn()
      .mockResolvedValue({ ...LIVE_DRAFT_COMPLETE_TERMS, status: 'ACTIVE' });
    const { service } = makeService({ findUnique, update });

    await service.update('c1', {
      status: 'ACTIVE',
      workCategory: 'Storm-water pipe laying',
      rateType: 'PER_PIPE',
      rate: 250,
      startDate: new Date('2026-09-08'),
    } as never);

    expect(update).toHaveBeenCalled();
  });

  it('does not enforce ACTIVE-requires-terms when the resulting status is not ACTIVE', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_MISSING_TERMS);
    const update = vi.fn().mockResolvedValue({
      ...LIVE_DRAFT_MISSING_TERMS,
      description: 'updated',
    });
    const { service } = makeService({ findUnique, update });

    await service.update('c1', { description: 'updated' });

    expect(update).toHaveBeenCalled();
  });

  it('throws NotFoundException, not a raw 500, when Prisma reports P2025', async () => {
    const findUnique = vi.fn().mockResolvedValue(LIVE_DRAFT_COMPLETE_TERMS);
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, { code: 'P2025', message: 'not found' });
    const update = vi.fn().mockRejectedValue(error);
    const { service } = makeService({ findUnique, update });

    await expect(
      service.update('c1', { status: 'ACTIVE' } as never),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('SiteContractsService.outstandingSummary', () => {
  it('sums outstandingAmount across every contract, grouped by Subcontractor, treating a Draft-pending contract as 0', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'c1',
        subcontractorId: 'sc1',
        subcontractor: { name: 'Ganesh Pipeline Works' },
        rateType: 'PER_PIPE',
        rate: new Prisma.Decimal(250),
        fixedAmount: null,
        quantityCompleted: new Prisma.Decimal(570),
        amountPaid: new Prisma.Decimal(80000),
        status: 'ACTIVE',
      },
      {
        id: 'c2',
        subcontractorId: 'sc1',
        subcontractor: { name: 'Ganesh Pipeline Works' },
        rateType: null,
        rate: null,
        fixedAmount: null,
        quantityCompleted: new Prisma.Decimal(0),
        amountPaid: new Prisma.Decimal(15000),
        status: 'DRAFT',
      },
      {
        id: 'c3',
        subcontractorId: 'sc2',
        subcontractor: { name: 'Bhide Electricals' },
        rateType: 'FIXED_COST',
        rate: null,
        fixedAmount: new Prisma.Decimal(50000),
        quantityCompleted: new Prisma.Decimal(0),
        amountPaid: new Prisma.Decimal(50000),
        status: 'COMPLETED',
      },
    ]);
    const { service } = makeService({ findMany });

    const result = await service.outstandingSummary();

    // c1: 250*570 - 80000 = 62500. c2: pending terms -> 0. c3: 50000-50000 = 0.
    expect(result.totalOutstanding).toBe(62500);
    expect(result.bySubcontractor).toEqual([
      {
        subcontractorId: 'sc1',
        subcontractorName: 'Ganesh Pipeline Works',
        outstanding: 62500,
      },
      {
        subcontractorId: 'sc2',
        subcontractorName: 'Bhide Electricals',
        outstanding: 0,
      },
    ]);
  });

  it('includes a Cancelled contract with a nonzero outstanding — money already owed does not stop being owed', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 'c1',
        subcontractorId: 'sc1',
        subcontractor: { name: 'Om Sai Earthmovers' },
        rateType: 'PER_TRIP',
        rate: new Prisma.Decimal(1500),
        fixedAmount: null,
        quantityCompleted: new Prisma.Decimal(10),
        amountPaid: new Prisma.Decimal(0),
        status: 'CANCELLED',
      },
    ]);
    const { service } = makeService({ findMany });

    const result = await service.outstandingSummary();

    expect(result.totalOutstanding).toBe(15000);
  });

  it('returns zero when there are no Site Contracts', async () => {
    const { service } = makeService({
      findMany: vi.fn().mockResolvedValue([]),
    });

    await expect(service.outstandingSummary()).resolves.toEqual({
      totalOutstanding: 0,
      bySubcontractor: [],
    });
  });
});

describe('SiteContractsService.countDraftPendingTerms', () => {
  it('counts only Draft contracts missing a genuinely required term', async () => {
    const count = vi.fn().mockResolvedValue(2);
    const { service, prisma } = makeService({ count });

    const result = await service.countDraftPendingTerms();

    expect(prisma.siteContract.count).toHaveBeenCalledWith({
      where: {
        status: 'DRAFT',
        OR: [
          { workCategory: null },
          { rateType: null },
          { startDate: null },
          { AND: [{ rateType: 'FIXED_COST' }, { fixedAmount: null }] },
          {
            AND: [
              { rateType: { not: 'FIXED_COST' } },
              { rateType: { not: null } },
              { rate: null },
            ],
          },
        ],
      },
    });
    expect(result).toBe(2);
  });
});
