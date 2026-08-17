import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createVendorSchema, updateVendorSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

describe('VendorsController', () => {
  let controller: VendorsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    purchases: ReturnType<typeof vi.fn>;
    purchaseSummary: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      findOne: vi.fn(),
      purchases: vi.fn(),
      purchaseSummary: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorsController],
      providers: [{ provide: VendorsService, useValue: service }],
    }).compile();

    controller = module.get<VendorsController>(VendorsController);
  });

  it('create delegates to VendorsService.create with the validated body', async () => {
    const input = {
      name: 'Shree Balaji Traders',
      materialsSupplied: ['Cement'],
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to VendorsService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Shree Balaji Traders' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Shree Balaji Traders' }]);
  });

  it('update delegates to VendorsService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'Renamed Traders' });

    const result = await controller.update('1', { name: 'Renamed Traders' });

    expect(service.update).toHaveBeenCalledWith('1', {
      name: 'Renamed Traders',
    });
    expect(result).toEqual({ id: '1', name: 'Renamed Traders' });
  });

  it('findOne delegates to VendorsService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({
      id: '1',
      name: 'Shree Balaji Traders',
    });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'Shree Balaji Traders' });
  });

  it('purchases delegates to VendorsService.purchases with the id', async () => {
    service.purchases.mockResolvedValue([{ id: 'p1' }]);

    const result = await controller.purchases('1');

    expect(service.purchases).toHaveBeenCalledWith('1');
    expect(result).toEqual([{ id: 'p1' }]);
  });

  it('purchaseSummary delegates to VendorsService.purchaseSummary with the id', async () => {
    service.purchaseSummary.mockResolvedValue({
      totalThisYear: 0,
      notFullyPaidTotal: 0,
    });

    const result = await controller.purchaseSummary('1');

    expect(service.purchaseSummary).toHaveBeenCalledWith('1');
    expect(result).toEqual({ totalThisYear: 0, notFullyPaidTotal: 0 });
  });
});

describe('ZodValidationPipe(createVendorSchema)', () => {
  const pipe = new ZodValidationPipe(createVendorSchema);

  it('rejects a body missing the required name', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);

    try {
      pipe.transform({});
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        error: { code: string; details: unknown };
      };
      expect(response.error.code).toBe('VALIDATION_FAILED');
      expect(response.error.details).toBeDefined();
    }
  });

  it('accepts a minimal body and defaults materialsSupplied to an empty array', () => {
    const result = pipe.transform({ name: 'Shree Balaji Traders' });
    expect(result).toEqual({
      name: 'Shree Balaji Traders',
      materialsSupplied: [],
    });
  });

  it('accepts materialsSupplied as a list of discrete tags', () => {
    const result = pipe.transform({
      name: 'Shree Balaji Traders',
      materialsSupplied: ['Cement', 'Steel', 'Aggregates'],
    });
    expect(result).toEqual({
      name: 'Shree Balaji Traders',
      materialsSupplied: ['Cement', 'Steel', 'Aggregates'],
    });
  });

  it('rejects an empty-string materialsSupplied item', () => {
    expect(() =>
      pipe.transform({ name: 'Shree Balaji Traders', materialsSupplied: [''] }),
    ).toThrow(BadRequestException);
  });

  it('rejects an invalid email', () => {
    expect(() =>
      pipe.transform({ name: 'Shree Balaji Traders', email: 'not-an-email' }),
    ).toThrow(BadRequestException);
  });
});

describe('ZodValidationPipe(updateVendorSchema)', () => {
  const pipe = new ZodValidationPipe(updateVendorSchema);

  it('accepts a partial body with only one field changed', () => {
    const result = pipe.transform({ phone: '+91 98200 41267' });
    expect(result).toEqual({ phone: '+91 98200 41267' });
  });

  it('accepts an empty body as a no-op update', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('does not silently reset materialsSupplied to [] when the field is omitted', () => {
    const result = pipe.transform({ name: 'Renamed Traders' });
    expect(result).not.toHaveProperty('materialsSupplied');
  });

  it('still enforces per-field rules when a field is present', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});
