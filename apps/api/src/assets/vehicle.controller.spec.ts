import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createVehicleSchema,
  updateVehicleSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

const validUuid = '123e4567-e89b-42d3-a456-426614174000';

describe('VehicleController', () => {
  let controller: VehicleController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleController],
      providers: [{ provide: VehicleService, useValue: service }],
    }).compile();

    controller = module.get<VehicleController>(VehicleController);
  });

  it('create delegates to VehicleService.create with the validated body', async () => {
    const input = { number: 'MH-12-AB-1234', typeId: validUuid };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to VehicleService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', number: 'MH-12-AB-1234' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', number: 'MH-12-AB-1234' }]);
  });

  it('list forwards q/page/pageSize/sort/order query params to VehicleService.list as one object', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('mh', '2', '10', 'driver', 'desc');

    expect(service.list).toHaveBeenCalledWith({
      q: 'mh',
      page: '2',
      pageSize: '10',
      sort: 'driver',
      order: 'desc',
    });
  });

  it('findOne delegates to VehicleService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: '1', number: 'MH-12-AB-1234' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', number: 'MH-12-AB-1234' });
  });

  it('update delegates to VehicleService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', driver: 'Suresh' });

    const result = await controller.update('1', { driver: 'Suresh' });

    expect(service.update).toHaveBeenCalledWith('1', { driver: 'Suresh' });
    expect(result).toEqual({ id: '1', driver: 'Suresh' });
  });
});

describe('ZodValidationPipe(createVehicleSchema)', () => {
  const pipe = new ZodValidationPipe(createVehicleSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('rejects a non-uuid typeId', () => {
    expect(() =>
      pipe.transform({ number: 'MH-12-AB-1234', typeId: 'not-a-uuid' }),
    ).toThrow(BadRequestException);
  });

  it('accepts a valid body with only the required fields', () => {
    const result = pipe.transform({
      number: 'MH-12-AB-1234',
      typeId: validUuid,
    });
    expect(result).toEqual({ number: 'MH-12-AB-1234', typeId: validUuid });
  });

  it('accepts optional ownership/driver', () => {
    expect(() =>
      pipe.transform({
        number: 'MH-12-AB-1234',
        typeId: validUuid,
        ownership: 'Rented',
        driver: 'Suresh',
      }),
    ).not.toThrow();
  });

  it('never validates currentStatus/currentSiteId — those fields are absent from the schema entirely', () => {
    const result = pipe.transform({
      number: 'MH-12-AB-1234',
      typeId: validUuid,
      currentStatus: 'AT_SITE',
      currentSiteId: validUuid,
    }) as Record<string, unknown>;
    expect(result).not.toHaveProperty('currentStatus');
    expect(result).not.toHaveProperty('currentSiteId');
  });
});

describe('ZodValidationPipe(updateVehicleSchema)', () => {
  const pipe = new ZodValidationPipe(updateVehicleSchema);

  it('accepts an empty body as a true no-op', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a partial body with only driver set', () => {
    expect(pipe.transform({ driver: 'Suresh' })).toEqual({ driver: 'Suresh' });
  });

  it('accepts null to clear an optional field (full-replace PATCH)', () => {
    expect(pipe.transform({ driver: null })).toEqual({ driver: null });
  });

  it('strips currentStatus/currentSiteId even when partial — those fields are absent from the schema entirely', () => {
    const result = pipe.transform({
      driver: 'Suresh',
      currentStatus: 'MAINTENANCE',
      currentSiteId: validUuid,
    }) as Record<string, unknown>;
    expect(result).not.toHaveProperty('currentStatus');
    expect(result).not.toHaveProperty('currentSiteId');
  });
});
