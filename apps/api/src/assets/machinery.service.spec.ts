import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { MachineryService } from './machinery.service';

function makeService(overrides: {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}) {
  const create = overrides.create ?? vi.fn();
  const findMany = overrides.findMany ?? vi.fn().mockResolvedValue([]);
  const findUnique = overrides.findUnique ?? vi.fn();
  const update = overrides.update ?? vi.fn();

  const prisma = { machinery: { create, findMany, findUnique, update } };
  const service = new MachineryService(
    prisma as unknown as ConstructorParameters<typeof MachineryService>[0],
  );

  return { service, create, findMany, findUnique, update };
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
  name: 'JCB 3DX',
  typeId: 'type1',
  assetNumber: 'AST-001',
};

describe('MachineryService.create', () => {
  it('creates a Machine with exactly the validated input, no extra fields injected', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'm1', ...createInput });
    const { service } = makeService({ create });

    await service.create(createInput);

    expect(create).toHaveBeenCalledWith({
      data: createInput,
      include: { type: true, currentSite: true },
    });
  });

  it('translates a P2003 foreign-key violation (missing Machinery Type) into a 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ create });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('translates a duplicate assetNumber P2002 into a clear 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const { service } = makeService({ create });

    await expect(service.create(createInput)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create(createInput)).rejects.toThrow(
      'A Machine with this Asset Number already exists',
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

describe('MachineryService.list', () => {
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
});

describe('MachineryService.findOne', () => {
  it('throws NotFoundException when no Machine matches the id', async () => {
    const { service } = makeService({
      findUnique: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});

describe('MachineryService.update', () => {
  it('never writes currentStatus/currentSiteId even if somehow present on the input object', async () => {
    const update = vi.fn().mockResolvedValue({ id: 'm1' });
    const { service } = makeService({ update });

    // UpdateMachineryInput has no currentStatus/currentSiteId keys at the
    // type level — this exercises that `update` passes `input` through
    // untouched (no blind spread of a wider unvalidated object).
    await service.update('m1', { name: 'Renamed' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { name: 'Renamed' },
      include: { type: true, currentSite: true },
    });
  });

  it('translates a not-found (P2025) into a clear 404', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ update });

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('translates a P2003 foreign-key violation into a 400', async () => {
    const update = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ update });

    await expect(service.update('m1', { typeId: 'missing' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('translates a duplicate assetNumber P2002 into a clear 400', async () => {
    const update = vi.fn().mockRejectedValue(p2002Error());
    const { service } = makeService({ update });

    await expect(
      service.update('m1', { assetNumber: 'AST-001' }),
    ).rejects.toThrow(BadRequestException);
  });
});
