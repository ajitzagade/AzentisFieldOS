import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { VendorsService } from './vendors.service';

function makeService(overrides: {
  vendorFindUnique?: ReturnType<typeof vi.fn>;
  vendorUpdate?: ReturnType<typeof vi.fn>;
  vendorFindMany?: ReturnType<typeof vi.fn>;
  vendorCount?: ReturnType<typeof vi.fn>;
  purchasesService?: {
    listByVendor: ReturnType<typeof vi.fn>;
    summaryForVendor: ReturnType<typeof vi.fn>;
  };
}) {
  const vendorFindUnique = overrides.vendorFindUnique ?? vi.fn();
  const vendorUpdate = overrides.vendorUpdate ?? vi.fn();
  const vendorFindMany = overrides.vendorFindMany ?? vi.fn();
  const vendorCount = overrides.vendorCount ?? vi.fn().mockResolvedValue(0);

  const prisma = {
    vendor: {
      findUnique: vendorFindUnique,
      update: vendorUpdate,
      findMany: vendorFindMany,
      count: vendorCount,
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

  it('searches by name case-insensitively', async () => {
    const vendorFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ vendorFindMany });

    await service.list({ q: 'anand' });

    expect(vendorFindMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        name: { contains: 'anand', mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  });

  it('sorts by an allowed field and direction', async () => {
    const vendorFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ vendorFindMany });

    await service.list({ sort: 'phone', order: 'desc' });

    expect(vendorFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { phone: 'desc' } }),
    );
  });

  it('falls back to the default name sort for an unrecognized sort field', async () => {
    const vendorFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ vendorFindMany });

    await service.list({ sort: 'deletedAt' });

    expect(vendorFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: 'asc' } }),
    );
  });

  it('returns a paginated envelope once page/pageSize is requested', async () => {
    const vendorFindMany = vi
      .fn()
      .mockResolvedValue([{ id: '1', name: 'Anand RMC Suppliers' }]);
    const vendorCount = vi.fn().mockResolvedValue(12);
    const { service } = makeService({ vendorFindMany, vendorCount });

    const result = await service.list({ page: '1', pageSize: '10' });

    expect(vendorFindMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      rows: [{ id: '1', name: 'Anand RMC Suppliers' }],
      total: 12,
      page: 1,
      pageSize: 10,
    });
  });
});

describe('VendorsService.update', () => {
  it('updates the Vendor and returns the result', async () => {
    const vendorUpdate = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'Renamed' });
    // update() first routes through findOne (soft-delete guard) — seed a
    // live (deletedAt: null) row.
    const vendorFindUnique = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'Old', deletedAt: null });
    const { service } = makeService({ vendorUpdate, vendorFindUnique });

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
    const vendorFindUnique = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'Old', deletedAt: null });
    const { service } = makeService({ vendorUpdate, vendorFindUnique });

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

describe('VendorsService.searchCandidates', () => {
  it('excludes soft-deleted Vendors and searches name/contactPerson/phone, capped at 200', async () => {
    const vendorFindMany = vi.fn().mockResolvedValue([{ id: '1' }]);
    const vendorCount = vi.fn().mockResolvedValue(1);
    const { service } = makeService({ vendorFindMany, vendorCount });

    const result = await service.searchCandidates('ramesh');

    expect(vendorFindMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: 'ramesh', mode: 'insensitive' } },
          { contactPerson: { contains: 'ramesh', mode: 'insensitive' } },
          { phone: { contains: 'ramesh', mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 200,
    });
    expect(vendorCount).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: 'ramesh', mode: 'insensitive' } },
          { contactPerson: { contains: 'ramesh', mode: 'insensitive' } },
          { phone: { contains: 'ramesh', mode: 'insensitive' } },
        ],
      },
    });
    expect(result).toEqual({ candidates: [{ id: '1' }], total: 1 });
  });
});
