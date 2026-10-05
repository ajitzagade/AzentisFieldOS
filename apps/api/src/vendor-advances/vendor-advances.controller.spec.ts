import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VendorAdvancesController } from './vendor-advances.controller';
import { VendorAdvancesService } from './vendor-advances.service';

describe('VendorAdvancesController', () => {
  let controller: VendorAdvancesController;
  let service: {
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    correct: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { list: vi.fn(), findOne: vi.fn(), correct: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorAdvancesController],
      providers: [{ provide: VendorAdvancesService, useValue: service }],
    }).compile();

    controller = module.get<VendorAdvancesController>(VendorAdvancesController);
  });

  it('list delegates to VendorAdvancesService.list with the given vendorId', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list('v1');

    expect(service.list).toHaveBeenCalledWith('v1');
    expect(result).toEqual([{ id: '1' }]);
  });

  // Review finding (2026-09-06): Prisma silently ignores an undefined
  // where-filter, so an omitted vendorId must be rejected here rather than
  // returning every Vendor's advances unscoped.
  it('rejects a missing vendorId instead of returning every Vendor unscoped', () => {
    expect(() => controller.list()).toThrow(BadRequestException);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('rejects an empty vendorId', () => {
    expect(() => controller.list('')).toThrow(BadRequestException);
  });

  it('findOne delegates to VendorAdvancesService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('correct delegates to VendorAdvancesService.correct with the validated body', async () => {
    const body = { correctsId: 'orig', amount: -500, reason: 'Overstated' };
    service.correct.mockResolvedValue({ id: 'c1', ...body });

    const result = await controller.correct(body);

    expect(service.correct).toHaveBeenCalledWith(body);
    expect(result).toEqual({ id: 'c1', ...body });
  });
});
