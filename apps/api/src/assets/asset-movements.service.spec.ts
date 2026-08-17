import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { AssetMovementsService } from './asset-movements.service';

function makeService(overrides: {
  machineryMovementLogCreate?: ReturnType<typeof vi.fn>;
  machineryMovementLogFindUnique?: ReturnType<typeof vi.fn>;
  machineryUpdate?: ReturnType<typeof vi.fn>;
  vehicleMovementLogCreate?: ReturnType<typeof vi.fn>;
  vehicleMovementLogFindUnique?: ReturnType<typeof vi.fn>;
  vehicleUpdate?: ReturnType<typeof vi.fn>;
}) {
  const machineryMovementLogCreate =
    overrides.machineryMovementLogCreate ??
    vi.fn().mockResolvedValue({ id: 'log1' });
  const machineryMovementLogFindUnique =
    overrides.machineryMovementLogFindUnique ?? vi.fn();
  const machineryUpdate =
    overrides.machineryUpdate ?? vi.fn().mockResolvedValue({ id: 'm1' });
  const vehicleMovementLogCreate =
    overrides.vehicleMovementLogCreate ??
    vi.fn().mockResolvedValue({ id: 'log1' });
  const vehicleMovementLogFindUnique =
    overrides.vehicleMovementLogFindUnique ?? vi.fn();
  const vehicleUpdate =
    overrides.vehicleUpdate ?? vi.fn().mockResolvedValue({ id: 'v1' });

  const tx = {
    machineryMovementLog: { create: machineryMovementLogCreate },
    machinery: { update: machineryUpdate },
    vehicleMovementLog: { create: vehicleMovementLogCreate },
    vehicle: { update: vehicleUpdate },
  };

  const prisma = {
    machineryMovementLog: { findUnique: machineryMovementLogFindUnique },
    vehicleMovementLog: { findUnique: vehicleMovementLogFindUnique },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(tx)),
  };

  const service = new AssetMovementsService(
    prisma as unknown as ConstructorParameters<typeof AssetMovementsService>[0],
  );

  return {
    service,
    prisma,
    machineryMovementLogCreate,
    machineryMovementLogFindUnique,
    machineryUpdate,
    vehicleMovementLogCreate,
    vehicleMovementLogFindUnique,
    vehicleUpdate,
  };
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

const machineryToSite = {
  assetType: 'MACHINERY' as const,
  assetId: 'm1',
  toStatus: 'AT_SITE' as const,
  siteId: 'site1',
  movedAt: new Date('2026-08-15'),
};

const machineryToMaintenance = {
  assetType: 'MACHINERY' as const,
  assetId: 'm1',
  toStatus: 'MAINTENANCE' as const,
  movedAt: new Date('2026-08-15'),
};

describe('AssetMovementsService.create — Machinery', () => {
  it('inserts a MachineryMovementLog row and updates Machinery.currentStatus/currentSiteId inside the same transaction', async () => {
    const { service, prisma, machineryMovementLogCreate, machineryUpdate } =
      makeService({});

    await service.create(machineryToSite);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(machineryMovementLogCreate).toHaveBeenCalledWith({
      data: {
        machineryId: 'm1',
        toStatus: 'AT_SITE',
        siteId: 'site1',
        movedAt: machineryToSite.movedAt,
        correctsId: undefined,
        reason: undefined,
      },
      include: { site: true },
    });
    expect(machineryUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { currentStatus: 'AT_SITE', currentSiteId: 'site1' },
    });
  });

  it('a MAINTENANCE movement clears currentSiteId to null even if a siteId were somehow present', async () => {
    const { service, machineryUpdate, machineryMovementLogCreate } =
      makeService({});

    await service.create(machineryToMaintenance);

    expect(machineryMovementLogCreate).toHaveBeenCalledWith({
      data: {
        machineryId: 'm1',
        toStatus: 'MAINTENANCE',
        siteId: null,
        movedAt: machineryToMaintenance.movedAt,
        correctsId: undefined,
        reason: undefined,
      },
      include: { site: true },
    });
    expect(machineryUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { currentStatus: 'MAINTENANCE', currentSiteId: null },
    });
  });

  it('an AVAILABLE movement clears currentSiteId to null', async () => {
    const { service, machineryUpdate } = makeService({});

    await service.create({ ...machineryToMaintenance, toStatus: 'AVAILABLE' });

    expect(machineryUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { currentStatus: 'AVAILABLE', currentSiteId: null },
    });
  });

  it('rejects a correctsId that does not reference an existing MachineryMovementLog', async () => {
    const machineryMovementLogFindUnique = vi.fn().mockResolvedValue(null);
    const { service } = makeService({ machineryMovementLogFindUnique });

    await expect(
      service.create({
        ...machineryToSite,
        correctsId: 'missing',
        reason: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("rejects a correction whose asset doesn't match the original Movement's Machine", async () => {
    const machineryMovementLogFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      machineryId: 'a-different-machine',
    });
    const { service } = makeService({ machineryMovementLogFindUnique });

    await expect(
      service.create({ ...machineryToSite, correctsId: 'orig', reason: 'x' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('a correcting movement still re-derives currentStatus/currentSiteId from its own toStatus/siteId (a restatement, not a delta)', async () => {
    const machineryMovementLogFindUnique = vi.fn().mockResolvedValue({
      id: 'orig',
      machineryId: 'm1',
    });
    const { service, machineryUpdate } = makeService({
      machineryMovementLogFindUnique,
    });

    await service.create({
      ...machineryToSite,
      siteId: 'corrected-site',
      correctsId: 'orig',
      reason: 'Was actually moved to a different Site',
    });

    expect(machineryUpdate).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { currentStatus: 'AT_SITE', currentSiteId: 'corrected-site' },
    });
  });

  it('translates a P2003 (bad assetId/siteId) into a 400, not a raw 500', async () => {
    const machineryMovementLogCreate = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ machineryMovementLogCreate });

    await expect(service.create(machineryToSite)).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('AssetMovementsService.create — Vehicle', () => {
  const vehicleToSite = {
    assetType: 'VEHICLE' as const,
    assetId: 'v1',
    toStatus: 'AT_SITE' as const,
    siteId: 'site1',
    movedAt: new Date('2026-08-15'),
  };

  it('inserts a VehicleMovementLog row and updates Vehicle.currentStatus/currentSiteId inside the same transaction, never touching Machinery', async () => {
    const {
      service,
      prisma,
      vehicleMovementLogCreate,
      vehicleUpdate,
      machineryUpdate,
    } = makeService({});

    await service.create(vehicleToSite);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(vehicleMovementLogCreate).toHaveBeenCalledWith({
      data: {
        vehicleId: 'v1',
        toStatus: 'AT_SITE',
        siteId: 'site1',
        movedAt: vehicleToSite.movedAt,
        correctsId: undefined,
        reason: undefined,
      },
      include: { site: true },
    });
    expect(vehicleUpdate).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { currentStatus: 'AT_SITE', currentSiteId: 'site1' },
    });
    expect(machineryUpdate).not.toHaveBeenCalled();
  });
});

describe('AssetMovementsService.list', () => {
  it('scopes to the given Machinery id, ordered desc by movedAt', async () => {
    const machineryMovementLogFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      machineryMovementLog: { findMany: machineryMovementLogFindMany },
      vehicleMovementLog: { findMany: vi.fn() },
      $transaction: vi.fn(),
    };
    const service = new AssetMovementsService(
      prisma as unknown as ConstructorParameters<
        typeof AssetMovementsService
      >[0],
    );

    await service.list('MACHINERY', 'm1');

    expect(machineryMovementLogFindMany).toHaveBeenCalledWith({
      where: { machineryId: 'm1' },
      include: { site: true },
      orderBy: { movedAt: 'desc' },
    });
  });

  it('scopes to the given Vehicle id, ordered desc by movedAt', async () => {
    const vehicleMovementLogFindMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      machineryMovementLog: { findMany: vi.fn() },
      vehicleMovementLog: { findMany: vehicleMovementLogFindMany },
      $transaction: vi.fn(),
    };
    const service = new AssetMovementsService(
      prisma as unknown as ConstructorParameters<
        typeof AssetMovementsService
      >[0],
    );

    await service.list('VEHICLE', 'v1');

    expect(vehicleMovementLogFindMany).toHaveBeenCalledWith({
      where: { vehicleId: 'v1' },
      include: { site: true },
      orderBy: { movedAt: 'desc' },
    });
  });
});
