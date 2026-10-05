import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { VendorAdvancesService } from './vendor-advances.service';

function makeService(overrides: {
  findMany?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
}) {
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const findUnique = overrides.findUnique ?? vi.fn();
  const create = overrides.create ?? vi.fn().mockResolvedValue({ id: 'c1' });
  const prisma = { vendorAdvance: { findMany, findUnique, create } };
  const service = new VendorAdvancesService(prisma as never);
  return { service, findMany, findUnique, create };
}

// A fresh Advance only ever comes from WasteDisposalService.create inline —
// this service's own writes are correction-only (see its class comment).
describe('VendorAdvancesService.list', () => {
  it('scopes to the given vendorId, includes the linked Waste Disposal, orders by givenAt desc', async () => {
    const { service, findMany } = makeService({});

    await service.list('v1');

    expect(findMany).toHaveBeenCalledWith({
      where: { vendorId: 'v1' },
      include: { wasteDisposal: { select: { id: true, wasteType: true } } },
      orderBy: { givenAt: 'desc' },
    });
  });
});

describe('VendorAdvancesService.findOne', () => {
  it('throws NotFoundException when the id does not exist', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('VendorAdvancesService.correct', () => {
  it('rejects a correctsId that does not reference an existing Vendor Advance', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(
      service.correct({ correctsId: 'missing', amount: -500, reason: 'Typo' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates a new row carrying the original vendorId/wasteDisposalId/givenAt and the signed amount delta', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      vendorId: 'v1',
      wasteDisposalId: 'wd1',
      amount: 5000,
      paymentMethod: 'Cash',
      givenAt: new Date('2026-09-06'),
    });
    const { service, create } = makeService({ findUnique });

    await service.correct({
      correctsId: 'orig',
      amount: -500,
      reason: 'Overstated by 500',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        vendorId: 'v1',
        wasteDisposalId: 'wd1',
        amount: -500,
        paymentMethod: 'Cash',
        givenAt: new Date('2026-09-06'),
        correctsId: 'orig',
        correctionReason: 'Overstated by 500',
      },
    });
  });

  it('falls back to the original paymentMethod when the correction omits one', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      vendorId: 'v1',
      wasteDisposalId: 'wd1',
      amount: 5000,
      paymentMethod: 'Cash',
      givenAt: new Date('2026-09-06'),
    });
    const { service, create } = makeService({ findUnique });

    await service.correct({
      correctsId: 'orig',
      amount: 200,
      reason: 'Understated',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        vendorId: 'v1',
        wasteDisposalId: 'wd1',
        amount: 200,
        paymentMethod: 'Cash',
        givenAt: new Date('2026-09-06'),
        correctsId: 'orig',
        correctionReason: 'Understated',
      },
    });
  });
});
