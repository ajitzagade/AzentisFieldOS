import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createReturnWastageSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReturnWastageController } from './return-wastage.controller';
import { ReturnWastageService } from './return-wastage.service';

describe('ReturnWastageController', () => {
  let controller: ReturnWastageController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnWastageController],
      providers: [{ provide: ReturnWastageService, useValue: service }],
    }).compile();

    controller = module.get<ReturnWastageController>(ReturnWastageController);
  });

  it('create delegates to ReturnWastageService.create with the validated body', async () => {
    const input = {
      siteId: '11111111-1111-4111-8111-111111111111',
      materialSizeId: '22222222-2222-4222-8222-222222222222',
      kind: 'WASTAGE' as const,
      quantity: 5,
      recordedAt: '2026-08-13',
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to ReturnWastageService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne delegates to ReturnWastageService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createReturnWastageSchema)', () => {
  const pipe = new ZodValidationPipe(createReturnWastageSchema);

  const base = {
    siteId: '11111111-1111-4111-8111-111111111111',
    materialSizeId: '22222222-2222-4222-8222-222222222222',
    recordedAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid WASTAGE body', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'WASTAGE', quantity: 5 }),
    ).not.toThrow();
  });

  it('accepts a valid RETURN body', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'RETURN', quantity: 5 }),
    ).not.toThrow();
  });

  it('rejects an invalid kind', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'LOST', quantity: 5 }),
    ).toThrow(BadRequestException);
  });

  it('rejects a non-positive quantity with no correctsId', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'WASTAGE', quantity: 0 }),
    ).toThrow(BadRequestException);
  });

  it('accepts a negative quantity delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        kind: 'WASTAGE',
        quantity: -2,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount',
      }),
    ).not.toThrow();
  });
});
