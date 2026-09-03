import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { VehicleService } from './vehicle.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
  count?: ReturnType<typeof vi.fn>;
}) {
  const create = overrides.create ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();
  const count = overrides.count ?? vi.fn().mockResolvedValue(0);

  const prisma = { vehicle: { create, findMany, findUnique, update, count } };
  const service = new VehicleService(
    prisma as unknown as ConstructorParameters<typeof VehicleService>[0],
  );

  return { service, create, findMany, findUnique, update, count };
}

function p2002Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2002',
    message: 'Unique constraint failed',
  });
}

function p2003Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2003',
    message: 'Foreign key constraint violated',
  });
}

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, { code: 'P2025', message: 'Record not found' });
}

const createInput = {
  number: 'MH-12-AB-1234',
  typeId: 'type1',
};

describe('VehicleService.create', () => {
  it('creates a Vehicle with exactly the validated input, no extra fields injected', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'v1', ...createInput });
    const { service } = makeService({ create });

    await service.create(createInput);

    expect(create).toHaveBeenCalledWith({
      data: createInput,
      include: { type: true, currentSite: true },
    });
  });

  it('translates a P2003 foreign-key violation (missing Vehicle Type) into a 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ create });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('translates a duplicate number P2002 into a clear 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const { service } = makeService({ create });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create(createInput)).rejects.toThrow(
      'A Vehicle with this Number already exists',
    );
  });

  it('re-throws any other error unchanged', async () => {
    const create = vi.fn().mockRejectedValue(new Error('connection lost'));
    const { service } = makeService({ create });

    await expect(service.create(createInput)).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('VehicleService.list', () => {
  it('includes type, currentSite, and the single latest movementLogs entry', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          type: true,
          currentSite: true,
          movementLogs: { orderBy: { movedAt: 'desc' }, take: 1 },
        },
      }),
    );
  });

  it('searches number case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ q: 'mh12' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { number: { contains: 'mh12', mode: 'insensitive' } },
      }),
    );
  });

  it('returns a paginated envelope once page/pageSize is requested', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'v1' }]);
    const count = vi.fn().mockResolvedValue(6);
    const { service } = makeService({ findMany, count });

    const result = await service.list({ page: '1', pageSize: '5' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 5 }),
    );
    expect(result).toEqual({
      rows: [{ id: 'v1' }],
      total: 6,
      page: 1,
      pageSize: 5,
    });
  });

  it('sorts by an allowed field and direction', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ sort: 'driver', order: 'desc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { driver: 'desc' } }),
    );
  });

  it('sorts by currentSite through the relation', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ sort: 'currentSite', order: 'desc' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { currentSite: { name: 'desc' } } }),
    );
  });

  it('falls back to the default number sort for an unrecognized sort field', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.list({ sort: 'id' });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { number: 'asc' } }),
    );
  });
});

describe('VehicleService.searchCandidates', () => {
  it('matches number, driver, and Vehicle Type name, all case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ findMany });

    await service.searchCandidates('tipper');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { number: { contains: 'tipper', mode: 'insensitive' } },
            { driver: { contains: 'tipper', mode: 'insensitive' } },
            {
              type: { name: { contains: 'tipper', mode: 'insensitive' } },
            },
          ],
        },
      }),
    );
  });
});

describe('VehicleService.findOne', () => {
  it('throws NotFoundException when no Vehicle matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('VehicleService.update', () => {
  it('never writes currentStatus/currentSiteId even if somehow present on the input object', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'v1' });
    const { service } = makeService({ update });

    await service.update('v1', { driver: 'Suresh' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { driver: 'Suresh' },
      include: { type: true, currentSite: true },
    });
  });

  it('translates a not-found (P2025) into a clear 404', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(service.update('missing', { driver: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('translates a P2003 foreign-key violation into a 400', async () => {
    const update = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ update });

    await expect(service.update('v1', { typeId: 'missing' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('translates a duplicate number P2002 into a clear 400', async () => {
    const update = vi.fn().mockRejectedValue(p2002Error());
    const { service } = makeService({ update });

    await expect(
      service.update('v1', { number: 'MH-12-AB-1234' }),
    ).rejects.toThrow(BadRequestException);
  });
});
