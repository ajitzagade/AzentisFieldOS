import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { VendorsService } from './vendors.service';

function makeService(overrides: {
  vendorFindUnique?: ReturnType<typeof vi.fn>;
  vendorUpdate?: ReturnType<typeof vi.fn>;
  vendorFindMany?: ReturnType<typeof vi.fn>;
  purchasesService?: {
    listByVendor: ReturnType<typeof vi.fn>;
    summaryForVendor: ReturnType<typeof vi.fn>;
  };
}) {
  const vendorFindUnique = overrides.vendorFindUnique ?? vi.fn();
  const vendorUpdate = overrides.vendorUpdate ?? vi.fn();
  const vendorFindMany = overrides.vendorFindMany ?? vi.fn();

  const prisma = {
    vendor: {
      findUnique: vendorFindUnique,
      update: vendorUpdate,
      findMany: vendorFindMany,
      create: vi.fn(),
    },
  };

  const purchasesService = overrides.purchasesService ?? {
    listByVendor: vi.fn(),
    summaryForVendor: vi.fn(),
  };

  const service = new VendorsService(
    prisma as unknown as ConstructorParameters<typeof VendorsService>[0],
    purchasesService as unknown as ConstructorParameters<
      typeof VendorsService
    >[1],
  );

  return { service, prisma, purchasesService };
}

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2025',
    message:
      'An operation failed because it depends on one or more records that were required but not found.',
  });
}

describe('VendorsService.list', () => {
  it('orders Vendors by name ascending and hides soft-deleted rows', async () => {
    const vendorFindMany = vi
      .fn()
      .mockResolvedValue([{ id: '1', name: 'Anand RMC Suppliers' }]);
    const { service } = makeService({ vendorFindMany });

    const result = await service.list();

    expect(vendorFindMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ id: '1', name: 'Anand RMC Suppliers' }]);
  });
});

describe('VendorsService.update', () => {
  it('updates the Vendor and returns the result', async () => {
    const vendorUpdate = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'Renamed' });
    const { service } = makeService({ vendorUpdate });

    const result = await service.update('1', { name: 'Renamed' });

    expect(vendorUpdate).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Renamed' },
    });
    expect(result).toEqual({ id: '1', name: 'Renamed' });
  });

  it('throws NotFoundException, not a raw 500, when Prisma reports P2025', async () => {
    const vendorUpdate = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ vendorUpdate });

    await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const vendorUpdate = vi
      .fn()
      .mockRejectedValue(new Error('connection lost'));
    const { service } = makeService({ vendorUpdate });

    await expect(service.update('1', { name: 'X' })).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('VendorsService.findOne', () => {
  it('throws NotFoundException for a Vendor ID that does not exist', async () => {
    const { service } = makeService({
      vendorFindUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns the Vendor when found', async () => {
    const { service } = makeService({
      vendorFindUnique: vi
        .fn()
        .mockResolvedValue({ id: '1', name: 'Shree Balaji Traders' }),
    });

    await expect(service.findOne('1')).resolves.toEqual({
      id: '1',
      name: 'Shree Balaji Traders',
    });
  });
});

describe('VendorsService.purchases', () => {
  it('delegates to PurchasesService.listByVendor rather than a parallel query, after confirming the Vendor exists', async () => {
    const listByVendor = vi.fn().mockResolvedValue([{ id: 'p1' }]);
    const { service, prisma } = makeService({
      vendorFindUnique: vi.fn().mockResolvedValue({ id: '1' }),
      purchasesService: { listByVendor, summaryForVendor: vi.fn() },
    });

    const result = await service.purchases('1');

    expect(prisma.vendor.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(listByVendor).toHaveBeenCalledWith('1');
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('throws NotFoundException for a Vendor ID that does not exist, without calling PurchasesService', async () => {
    const listByVendor = vi.fn();
    const { service } = makeService({
      vendorFindUnique: vi.fn().mockResolvedValue(null),
      purchasesService: { listByVendor, summaryForVendor: vi.fn() },
    });

    await expect(service.purchases('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(listByVendor).not.toHaveBeenCalled();
  });
});

describe('VendorsService.purchaseSummary', () => {
  it('delegates to PurchasesService.summaryForVendor after confirming the Vendor exists', async () => {
    const summaryForVendor = vi
      .fn()
      .mockResolvedValue({ totalThisYear: 0, notFullyPaidTotal: 0 });
    const { service } = makeService({
      vendorFindUnique: vi.fn().mockResolvedValue({ id: '1' }),
      purchasesService: { listByVendor: vi.fn(), summaryForVendor },
    });

    const result = await service.purchaseSummary('1');

    expect(summaryForVendor).toHaveBeenCalledWith('1');
    expect(result).toEqual({ totalThisYear: 0, notFullyPaidTotal: 0 });
  });

  it('returns 0/0 for a Vendor with zero Purchases, not an error', async () => {
    const summaryForVendor = vi
      .fn()
      .mockResolvedValue({ totalThisYear: 0, notFullyPaidTotal: 0 });
    const { service } = makeService({
      vendorFindUnique: vi.fn().mockResolvedValue({ id: '1' }),
      purchasesService: { listByVendor: vi.fn(), summaryForVendor },
    });

    await expect(service.purchaseSummary('1')).resolves.toEqual({
      totalThisYear: 0,
      notFullyPaidTotal: 0,
    });
  });
});
