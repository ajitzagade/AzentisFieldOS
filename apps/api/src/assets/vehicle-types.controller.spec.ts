import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVehicleTypeSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { VehicleTypesController } from './vehicle-types.controller';
import { VehicleTypesService } from './vehicle-types.service';

describe('VehicleTypesController', () => {
  let controller: VehicleTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleTypesController],
      providers: [{ provide: VehicleTypesService, useValue: service }],
    }).compile();

    controller = module.get<VehicleTypesController>(VehicleTypesController);
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
