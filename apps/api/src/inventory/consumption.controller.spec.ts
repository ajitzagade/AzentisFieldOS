import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConsumptionSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ConsumptionController } from './consumption.controller';
import { ConsumptionService } from './consumption.service';

describe('ConsumptionController', () => {
  let controller: ConsumptionController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumptionController],
      providers: [{ provide: ConsumptionService, useValue: service }],
    }).compile();

    controller = module.get<ConsumptionController>(ConsumptionController);
  });

  it('create delegates to ConsumptionService.create with the validated body and the session user', async () => {
    const input = {
      siteId: '11111111-1111-4111-8111-111111111111',
      materialSizeId: '22222222-2222-4222-8222-222222222222',
      quantity: 10,
      consumedAt: '2026-08-13',
    };
    const user = {
      id: '33333333-3333-4333-8333-333333333333',
      role: 'OWNER_ADMIN' as const,
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(user, input);

    expect(service.create).toHaveBeenCalledWith(input, user.id);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to ConsumptionService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne delegates to ConsumptionService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createConsumptionSchema)', () => {
  const pipe = new ZodValidationPipe(createConsumptionSchema);

  const base = {
    siteId: '11111111-1111-4111-8111-111111111111',
    materialSizeId: '22222222-2222-4222-8222-222222222222',
    consumedAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body with a positive quantity', () => {
    expect(() => pipe.transform({ ...base, quantity: 10 })).not.toThrow();
  });

  it('rejects a non-positive quantity with no correctsId', () => {
    expect(() => pipe.transform({ ...base, quantity: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, quantity: -5 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a negative quantity delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        quantity: -3,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount',
      }),
    ).not.toThrow();
  });

  it('rejects a correction with no reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        quantity: -3,
        correctsId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });
});
