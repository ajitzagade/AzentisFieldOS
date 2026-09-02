import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { SubcontractorsService } from './subcontractors.service';

function makeService(overrides: {
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  count?: ReturnType<typeof vi.fn>;
  siteContractsService?: { list: ReturnType<typeof vi.fn> };
}) {
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn();
  const count = overrides.count ?? vi.fn().mockResolvedValue(0);

  const prisma = {
    subcontractor: { findUnique, update, findMany, count, create: vi.fn() },
  };

  const siteContractsService = overrides.siteContractsService ?? {
    list: vi.fn(),
  };

  const service = new SubcontractorsService(
    prisma as unknown as ConstructorParameters<typeof SubcontractorsService>[0],
    siteContractsService as unknown as ConstructorParameters<
      typeof SubcontractorsService
    >[1],
  );

  return { service, prisma, siteContractsService };
}

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2025',
    message: 'record not found',
  });
}

describe('SubcontractorsService.list', () => {
  it('orders Subcontractors by name ascending and hides soft-deleted rows', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: '1', name: 'Ganesh Pipeline Works' }]);
    const { service } = makeService({ findMany });

    const result = await service.list();

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual([{ id: '1', name: 'Ganesh Pipeline Works' }]);
  });

  it('searches by name case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ q: 'ganesh' });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        name: { contains: 'ganesh', mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
  });

  it('returns a paginated envelope once page/pageSize is requested', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([{ id: '1', name: 'Ganesh Pipeline Works' }]);
    const count = vi.fn().mockResolvedValue(4);
    const { service } = makeService({ findMany, count });

    const result = await service.list({ page: '1', pageSize: '10' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      rows: [{ id: '1', name: 'Ganesh Pipeline Works' }],
      total: 4,
      page: 1,
      pageSize: 10,
    });
  });
});

describe('SubcontractorsService.update', () => {
  it('updates the Subcontractor and returns the result', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', name: 'Renamed' });
    const findUnique = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'Old', deletedAt: null });
    const { service } = makeService({ update, findUnique });

    const result = await service.update('1', { name: 'Renamed' });

    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Renamed' },
    });
    expect(result).toEqual({ id: '1', name: 'Renamed' });
  });

  it('throws NotFoundException, not a raw 500, when Prisma reports P2025', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const findUnique = vi.fn().mockResolvedValue({ id: '1', deletedAt: null });
    const { service } = makeService({ update, findUnique });

    await expect(service.update('1', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('SubcontractorsService.findOne', () => {
  it('throws NotFoundException for a Subcontractor ID that does not exist', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns the Subcontractor when found', async () => {
    const { service } = makeService({
      findUnique: vi
        .fn()
        .mockResolvedValue({ id: '1', name: 'Ganesh Pipeline Works' }),
    });

    await expect(service.findOne('1')).resolves.toEqual({
      id: '1',
      name: 'Ganesh Pipeline Works',
    });
  });
});

describe('SubcontractorsService.contracts', () => {
  it('delegates to SiteContractsService.list rather than a parallel query, after confirming the Subcontractor exists', async () => {
    const list = vi.fn().mockResolvedValue([{ id: 'c1' }]);
    const { service, prisma } = makeService({
      findUnique: vi.fn().mockResolvedValue({ id: '1', deletedAt: null }),
      siteContractsService: { list },
    });

    const result = await service.contracts('1');

    expect(prisma.subcontractor.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
    expect(list).toHaveBeenCalledWith({ subcontractorId: '1' });
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('throws NotFoundException for a Subcontractor ID that does not exist, without calling SiteContractsService', async () => {
    const list = vi.fn();
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
      siteContractsService: { list },
    });

    await expect(service.contracts('missing-id')).rejects.toThrow(
      NotFoundException,
    );
    expect(list).not.toHaveBeenCalled();
  });
});
