import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completePurchasePricingSchema,
  createPurchaseSchema,
} from '@azentisfieldos/shared';
import { ROLES_KEY } from '../auth/roles.decorator';
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
    countPendingPricing: ReturnType<typeof vi.fn>;
    completePricing: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      countThisMonth: vi.fn(),
      countPendingPricing: vi.fn(),
      completePricing: vi.fn(),
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

  it('list delegates to PurchasesService.list with pendingPricing false when the query param is absent', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalledWith({ pendingPricing: false });
    expect(result).toEqual([{ id: '1' }]);
  });

  // Story 19.5: `?pendingPricing=true` is the only recognized truthy value —
  // this is the deep-link fetch the Owner Dashboard makes when exactly one
  // Purchase is pending.
  it("list passes pendingPricing: true through when the query param is the string 'true'", async () => {
    service.list.mockResolvedValue([{ id: 'p1' }]);

    const result = await controller.list('true');

    expect(service.list).toHaveBeenCalledWith({ pendingPricing: true });
    expect(result).toEqual([{ id: 'p1' }]);
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

  // D7 delegation — mirrors the countThisMonth pattern.
  it('countPendingPricing delegates to the service', async () => {
    service.countPendingPricing.mockResolvedValue(3);
    await expect(controller.countPendingPricing()).resolves.toBe(3);
  });

  it('completePricing delegates id and body to the service', async () => {
    const pricing = {
      rate: 390,
      totalAmount: 19500,
      paymentStatus: 'UNPAID' as const,
    };
    service.completePricing.mockResolvedValue({ id: 'p1', ...pricing });
    await expect(controller.completePricing('p1', pricing)).resolves.toEqual({
      id: 'p1',
      ...pricing,
    });
    expect(service.completePricing).toHaveBeenCalledWith('p1', pricing);
  });

  // The role restriction IS the D7 boundary ("Supervisor records physical
  // facts, Owner completes pricing") — pin the metadata so deleting the
  // decorator fails a test, same convention as audit.controller.spec.
  it('completePricing is restricted to OWNER_ADMIN via @Roles metadata', () => {
    const roles = Reflect.getMetadata(
      ROLES_KEY,
      PurchasesController.prototype.completePricing,
    ) as string[] | undefined;
    expect(roles).toEqual(['OWNER_ADMIN']);
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

  // D7: a Supervisor's inward entry carries no pricing at all.
  it('accepts a body with no pricing fields (Pricing pending entry)', () => {
    const { rate: _r, totalAmount: _t, paymentStatus: _p, ...unpriced } = base;
    expect(() =>
      pipe.transform({ ...unpriced, destination: 'GODOWN' }),
    ).not.toThrow();
  });

  it('rejects a partial pricing group (rate without totalAmount/paymentStatus)', () => {
    const { totalAmount: _t, paymentStatus: _p, ...partial } = base;
    expect(() => pipe.transform({ ...partial, destination: 'GODOWN' })).toThrow(
      BadRequestException,
    );
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

  it('rejects a non-positive quantity with no correctsId', () => {
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

// D7: the Owner's one-time pricing completion — all three fields required,
// amounts positive.
describe('ZodValidationPipe(completePurchasePricingSchema)', () => {
  const pipe = new ZodValidationPipe(completePurchasePricingSchema);

  it('accepts a complete pricing body', () => {
    expect(() =>
      pipe.transform({
        rate: 390,
        totalAmount: 19500,
        paymentStatus: 'UNPAID',
      }),
    ).not.toThrow();
  });

  it('rejects a non-positive rate or total', () => {
    expect(() =>
      pipe.transform({ rate: 0, totalAmount: 19500, paymentStatus: 'UNPAID' }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({ rate: 390, totalAmount: -1, paymentStatus: 'UNPAID' }),
    ).toThrow(BadRequestException);
  });

  it('rejects a missing paymentStatus', () => {
    expect(() => pipe.transform({ rate: 390, totalAmount: 19500 })).toThrow(
      BadRequestException,
    );
  });
});
