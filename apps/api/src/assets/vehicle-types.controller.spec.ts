import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { VehicleTypesController } from './vehicle-types.controller';
import { VehicleTypesService } from './vehicle-types.service';

describe('VehicleTypesController', () => {
  let controller: VehicleTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleTypesController],
      providers: [{ provide: VehicleTypesService, useValue: service }],
    }).compile();

    controller = module.get<VehicleTypesController>(VehicleTypesController);
  });

  it('update delegates to VehicleTypesService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
  });

  it('create delegates to VehicleTypesService.create with the validated body', async () => {
    const input = { name: 'Truck' };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to VehicleTypesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Truck' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Truck' }]);
  });
});

describe('ZodValidationPipe(createVehicleTypeSchema)', () => {
  const pipe = new ZodValidationPipe(createVehicleTypeSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    expect(pipe.transform({ name: 'Truck' })).toEqual({ name: 'Truck' });
  });
});

describe('VehicleTypesService.create', () => {
  function makeService(create: ReturnType<typeof vi.fn>) {
    const prisma = { vehicleType: { create } };
    return new VehicleTypesService(
      prisma as unknown as ConstructorParameters<typeof VehicleTypesService>[0],
    );
  }

  it('translates a duplicate-name P2002 into a clear 400, not a raw 500', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, {
      code: 'P2002',
      message: 'Unique constraint failed',
    });
    const create = vi.fn().mockRejectedValue(error);
    const service = makeService(create);

    await expect(service.create({ name: 'Truck' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const create = vi.fn().mockRejectedValue(new Error('connection lost'));
    const service = makeService(create);

    await expect(service.create({ name: 'Truck' })).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('ZodValidationPipe(updateVehicleTypeSchema)', () => {
  const pipe = new ZodValidationPipe(updateVehicleTypeSchema);

  it('accepts an empty body as a true no-op', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a rename-only and a disable-only body', () => {
    expect(pipe.transform({ name: 'Trailer' })).toEqual({ name: 'Trailer' });
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });

  it('rejects an empty name', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});

describe('VehicleTypesService.update (Story 14.3 rename/disable)', () => {
  function makeService(update: ReturnType<typeof vi.fn>) {
    const prisma = { vehicleType: { update } };
    return new VehicleTypesService(
      prisma as unknown as ConstructorParameters<typeof VehicleTypesService>[0],
    );
  }

  function knownError(code: string) {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, { code, message: code });
  }

  it('renames and disables via prisma.vehicleType.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', name: 'Trailer' });
    const service = makeService(update);

    await service.update('1', { name: 'Trailer' });
    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Trailer' },
    });

    await service.update('1', { isActive: false });
    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { isActive: false },
    });
  });

  it('throws NotFoundException on P2025', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2025'));
    const service = makeService(update);

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('translates a duplicate-name P2002 into a 400', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2002'));
    const service = makeService(update);

    await expect(service.update('1', { name: 'Truck' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
