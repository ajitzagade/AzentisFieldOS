import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPurchaseSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

describe('PurchasesController', () => {
  let controller: PurchasesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    countThisMonth: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      countThisMonth: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [{ provide: PurchasesService, useValue: service }],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
  });

  it('create delegates to PurchasesService.create with the validated body', async () => {
    const input = {
      vendorId: '11111111-1111-4111-8111-111111111111',
      materialSizeId: '22222222-2222-4222-8222-222222222222',
      destination: 'GODOWN' as const,
      quantity: 100,
      rate: 50,
      totalAmount: 5000,
      paymentStatus: 'PAID' as const,
      purchasedAt: '2026-08-13',
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to PurchasesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne delegates to PurchasesService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('countThisMonth delegates to PurchasesService.countThisMonth', async () => {
    service.countThisMonth.mockResolvedValue(14);

    const result = await controller.countThisMonth();

    expect(service.countThisMonth).toHaveBeenCalled();
    expect(result).toBe(14);
  });
});

describe('ZodValidationPipe(createPurchaseSchema)', () => {
  const pipe = new ZodValidationPipe(createPurchaseSchema);

  const base = {
    vendorId: '11111111-1111-4111-8111-111111111111',
    materialSizeId: '22222222-2222-4222-8222-222222222222',
    quantity: 100,
    rate: 50,
    totalAmount: 5000,
    paymentStatus: 'PAID',
    purchasedAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid GODOWN-destined body with no siteId', () => {
    expect(() =>
      pipe.transform({ ...base, destination: 'GODOWN' }),
    ).not.toThrow();
  });

  it('rejects a GODOWN-destined body that includes a siteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        destination: 'GODOWN',
        siteId: '33333333-3333-4333-8333-333333333333',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a SITE-destined body missing siteId', () => {
    expect(() => pipe.transform({ ...base, destination: 'SITE' })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a valid SITE-destined body with a siteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        destination: 'SITE',
        siteId: '33333333-3333-4333-8333-333333333333',
      }),
    ).not.toThrow();
  });

  it('rejects a non-negative quantity with no correctsId', () => {
    expect(() =>
      pipe.transform({ ...base, destination: 'GODOWN', quantity: 0 }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({ ...base, destination: 'GODOWN', quantity: -5 }),
    ).toThrow(BadRequestException);
  });

  it('accepts a negative quantity delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        destination: 'GODOWN',
        quantity: -20,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount: 20 short of original delivery',
      }),
    ).not.toThrow();
  });

  it('rejects a zero-quantity correction', () => {
    expect(() =>
      pipe.transform({
        ...base,
        destination: 'GODOWN',
        quantity: 0,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a correction with no reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        destination: 'GODOWN',
        quantity: -20,
        correctsId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });
});
