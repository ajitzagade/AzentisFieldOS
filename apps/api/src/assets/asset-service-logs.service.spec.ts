import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { AssetServiceLogsService } from './asset-service-logs.service';

function makeService(overrides: {
  machineryServiceLogCreate?: ReturnType<typeof vi.fn>;
  machineryServiceLogFindMany?: ReturnType<typeof vi.fn>;
  machineryServiceLogUpdate?: ReturnType<typeof vi.fn>;
  vehicleServiceLogCreate?: ReturnType<typeof vi.fn>;
  vehicleServiceLogFindMany?: ReturnType<typeof vi.fn>;
  vehicleServiceLogUpdate?: ReturnType<typeof vi.fn>;
}) {
  const machineryServiceLogCreate =
    overrides.machineryServiceLogCreate ??
    vi.fn().mockResolvedValue({ id: 'log1' });
  const machineryServiceLogFindMany =
    overrides.machineryServiceLogFindMany ?? vi.fn().mockResolvedValue([]);
  const machineryServiceLogUpdate =
    overrides.machineryServiceLogUpdate ??
    vi.fn().mockResolvedValue({ id: 'log1' });
  const vehicleServiceLogCreate =
    overrides.vehicleServiceLogCreate ??
    vi.fn().mockResolvedValue({ id: 'log1' });
  const vehicleServiceLogFindMany =
    overrides.vehicleServiceLogFindMany ?? vi.fn().mockResolvedValue([]);
  const vehicleServiceLogUpdate =
    overrides.vehicleServiceLogUpdate ??
    vi.fn().mockResolvedValue({ id: 'log1' });

  const prisma = {
    machineryServiceLog: {
      create: machineryServiceLogCreate,
      findMany: machineryServiceLogFindMany,
      update: machineryServiceLogUpdate,
    },
    vehicleServiceLog: {
      create: vehicleServiceLogCreate,
      findMany: vehicleServiceLogFindMany,
      update: vehicleServiceLogUpdate,
    },
  };

  const service = new AssetServiceLogsService(
    prisma as unknown as ConstructorParameters<
      typeof AssetServiceLogsService
    >[0],
  );

  return {
    service,
    prisma,
    machineryServiceLogCreate,
    machineryServiceLogFindMany,
    machineryServiceLogUpdate,
    vehicleServiceLogCreate,
    vehicleServiceLogFindMany,
    vehicleServiceLogUpdate,
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

function p2025Error(): InstanceType<
  typeof Prisma.PrismaClientKnownRequestError
> {
  const error = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
  return Object.assign(error, {
    code: 'P2025',
    message: 'Record not found',
  });
}

const machineryFuelEntry = {
  assetType: 'MACHINERY' as const,
  assetId: 'm1',
  kind: 'FUEL' as const,
  notes: 'Filled up',
  cost: 1500,
  serviceDate: new Date('2026-08-15'),
};

describe('AssetServiceLogsService.create', () => {
  it('creates a MachineryServiceLog row for assetType MACHINERY, no transaction/current-state update involved', async () => {
    const { service, machineryServiceLogCreate, vehicleServiceLogCreate } =
      makeService({});

    await service.create(machineryFuelEntry);

    expect(machineryServiceLogCreate).toHaveBeenCalledWith({
      data: {
        machineryId: 'm1',
        kind: 'FUEL',
        notes: 'Filled up',
        cost: 1500,
        serviceDate: machineryFuelEntry.serviceDate,
      },
    });
    expect(vehicleServiceLogCreate).not.toHaveBeenCalled();
  });

  it('creates a VehicleServiceLog row for assetType VEHICLE, never touching Machinery', async () => {
    const { service, machineryServiceLogCreate, vehicleServiceLogCreate } =
      makeService({});

    await service.create({
      assetType: 'VEHICLE',
      assetId: 'v1',
      kind: 'REPAIR',
      serviceDate: new Date('2026-08-15'),
    });

    expect(vehicleServiceLogCreate).toHaveBeenCalledWith({
      data: {
        vehicleId: 'v1',
        kind: 'REPAIR',
        notes: undefined,
        cost: undefined,
        serviceDate: new Date('2026-08-15'),
      },
    });
    expect(machineryServiceLogCreate).not.toHaveBeenCalled();
  });

  it('translates a P2003 (bad assetId) into a 400, not a raw 500', async () => {
    const machineryServiceLogCreate = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ machineryServiceLogCreate });

    await expect(service.create(machineryFuelEntry)).rejects.toThrow(
      BadRequestException,
    );
  });
});

describe('AssetServiceLogsService.list', () => {
  it('scopes to the given Machinery id, ordered desc by serviceDate', async () => {
    const { service, machineryServiceLogFindMany } = makeService({});

    await service.list('MACHINERY', 'm1');

    expect(machineryServiceLogFindMany).toHaveBeenCalledWith({
      where: { machineryId: 'm1' },
      orderBy: { serviceDate: 'desc' },
    });
  });

  it('scopes to the given Vehicle id, ordered desc by serviceDate', async () => {
    const { service, vehicleServiceLogFindMany } = makeService({});

    await service.list('VEHICLE', 'v1');

    expect(vehicleServiceLogFindMany).toHaveBeenCalledWith({
      where: { vehicleId: 'v1' },
      orderBy: { serviceDate: 'desc' },
    });
  });
});

describe('AssetServiceLogsService.update', () => {
  it('updates a MachineryServiceLog row in place — a normal edit, not a correction', async () => {
    const { service, machineryServiceLogUpdate, vehicleServiceLogUpdate } =
      makeService({});

    await service.update('log1', 'MACHINERY', { kind: 'REPAIR' });

    expect(machineryServiceLogUpdate).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: { kind: 'REPAIR' },
    });
    expect(vehicleServiceLogUpdate).not.toHaveBeenCalled();
  });

  it('updates a VehicleServiceLog row in place', async () => {
    const { service, vehicleServiceLogUpdate } = makeService({});

    await service.update('log1', 'VEHICLE', { notes: null });

    expect(vehicleServiceLogUpdate).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: { notes: null },
    });
  });

  it('translates a P2025 (missing row) into a 404', async () => {
    const machineryServiceLogUpdate = vi.fn().mockRejectedValue(p2025Error());
    const { service } = makeService({ machineryServiceLogUpdate });

    await expect(
      service.update('missing', 'MACHINERY', { kind: 'FUEL' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('translates a P2003 into a 400', async () => {
    const vehicleServiceLogUpdate = vi.fn().mockRejectedValue(p2003Error());
    const { service } = makeService({ vehicleServiceLogUpdate });

    await expect(
      service.update('log1', 'VEHICLE', { kind: 'FUEL' }),
    ).rejects.toThrow(BadRequestException);
  });
});
