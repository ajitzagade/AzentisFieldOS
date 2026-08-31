import { describe, expect, it, vi } from 'vitest';
import { SitesService } from './sites.service';

function makeService(
  findMany: ReturnType<typeof vi.fn>,
  count?: ReturnType<typeof vi.fn>,
) {
  const prisma = { site: { findMany, count: count ?? vi.fn() } };
  return new SitesService(
    prisma as unknown as ConstructorParameters<typeof SitesService>[0],
    {} as ConstructorParameters<typeof SitesService>[1],
  );
}

describe('SitesService.list — search, sort, pagination', () => {
  it('with no query params, returns a plain array exactly like today (AC #7 — no existing picker caller breaks)', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: '1' }]);
    const service = makeService(findMany);

    const result = await service.list({});

    expect(Array.isArray(result)).toBe(true);
    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('searches name, location, and contract reference case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = makeService(findMany);

    await service.list({ q: 'nashik' });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: 'nashik', mode: 'insensitive' } },
          { location: { contains: 'nashik', mode: 'insensitive' } },
          { contractReference: { contains: 'nashik', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('sorts by an allowed field and direction', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = makeService(findMany);

    await service.list({ sort: 'name', order: 'desc' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'desc' },
    });
  });

  it('falls back to the default sort for an unrecognized sort field, never a raw Prisma error', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = makeService(findMany);

    await service.list({ sort: 'passwordHash' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('falls back to ascending for an invalid order value instead of forwarding it raw to Prisma', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = makeService(findMany);

    await service.list({ sort: 'name', order: 'garbage' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  });

  it('ignores an invalid status value instead of forwarding it raw to Prisma', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const service = makeService(findMany);

    await service.list({ status: 'NOT_A_REAL_STATUS' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns a paginated envelope with rows/total/page/pageSize once page or pageSize is requested', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]);
    const count = vi.fn().mockResolvedValue(42);
    const service = makeService(findMany, count);

    const result = await service.list({ page: '2', pageSize: '10' });

    expect(findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(result).toEqual({
      rows: [{ id: '1' }, { id: '2' }],
      total: 42,
      page: 2,
      pageSize: 10,
    });
  });

  it('combines status, search, sort, and pagination in one call', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const service = makeService(findMany, count);

    await service.list({
      status: 'ACTIVE',
      q: 'metro',
      sort: 'location',
      order: 'asc',
      page: '1',
      pageSize: '25',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          { name: { contains: 'metro', mode: 'insensitive' } },
          { location: { contains: 'metro', mode: 'insensitive' } },
          { contractReference: { contains: 'metro', mode: 'insensitive' } },
        ],
      },
      orderBy: { location: 'asc' },
      skip: 0,
      take: 25,
    });
  });
});

describe('SitesService.searchCandidates', () => {
  it('excludes soft-deleted Sites and searches name/location/contractReference, capped at 200', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: '1' }]);
    const count = vi.fn().mockResolvedValue(1);
    const service = makeService(findMany, count);

    const result = await service.searchCandidates('nashik');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: 'nashik', mode: 'insensitive' } },
          { location: { contains: 'nashik', mode: 'insensitive' } },
          { contractReference: { contains: 'nashik', mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take: 200,
    });
    expect(count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: 'nashik', mode: 'insensitive' } },
          { location: { contains: 'nashik', mode: 'insensitive' } },
          { contractReference: { contains: 'nashik', mode: 'insensitive' } },
        ],
      },
    });
    expect(result).toEqual({ candidates: [{ id: '1' }], total: 1 });
  });
});
