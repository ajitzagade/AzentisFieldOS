import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRmcEntrySchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RmcController } from './rmc.controller';
import { RmcService } from './rmc.service';

describe('RmcController', () => {
  let controller: RmcController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    report: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    statsThisMonth: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      report: vi.fn(),
      findOne: vi.fn(),
      statsThisMonth: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RmcController],
      providers: [{ provide: RmcService, useValue: service }],
    }).compile();

    controller = module.get<RmcController>(RmcController);
  });

  it('create delegates to RmcService.create with the validated body', async () => {
    const input = {
      siteId: '11111111-1111-4111-8111-111111111111',
      vendorId: '22222222-2222-4222-8222-222222222222',
      quantityM3: 42,
      grade: 'M25',
      ratePerM3: 6200,
      totalAmount: 260400,
      deliveredAt: new Date('2026-08-13'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to RmcService.list with siteId/vendorId/date query params (AC #2)', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list('site1', 'vendor1', '2026-08-13');

    expect(service.list).toHaveBeenCalledWith({
      siteId: 'site1',
      vendorId: 'vendor1',
      date: '2026-08-13',
    });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list forwards sort/order query params to RmcService.list', async () => {
    service.list.mockResolvedValue([]);

    await controller.list(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'totalAmount',
      'desc',
    );

    expect(service.list).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'totalAmount', order: 'desc' }),
    );
  });

  it('list tolerates no filters at all', async () => {
    service.list.mockResolvedValue([]);

    await controller.list();

    expect(service.list).toHaveBeenCalledWith({
      siteId: undefined,
      vendorId: undefined,
      date: undefined,
    });
  });

  it('report delegates to RmcService.report with the groupBy key and from/to range (FR-27)', async () => {
    service.report.mockResolvedValue([{ key: 'site1', label: 'Site 1' }]);

    const result = await controller.report('site', '2026-08-01', '2026-08-31');

    expect(service.report).toHaveBeenCalledWith('site', {
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(result).toEqual([{ key: 'site1', label: 'Site 1' }]);
  });

  it('report defaults to the daily slice when no groupBy is given', async () => {
    service.report.mockResolvedValue([]);

    await controller.report(undefined, undefined, undefined);

    expect(service.report).toHaveBeenCalledWith('day', {
      from: undefined,
      to: undefined,
    });
  });

  it('report rejects an unrecognized groupBy with a 400, never reaching the service', () => {
    expect(() => controller.report('bogus')).toThrow(BadRequestException);
    expect(service.report).not.toHaveBeenCalled();
  });

  it('findOne delegates to RmcService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('statsThisMonth delegates to RmcService.statsThisMonth', async () => {
    service.statsThisMonth.mockResolvedValue({
      totalQuantityM3: 196,
      totalCost: 1244900,
      activeVendorCount: 1,
    });

    const result = await controller.statsThisMonth();

    expect(service.statsThisMonth).toHaveBeenCalled();
    expect(result).toEqual({
      totalQuantityM3: 196,
      totalCost: 1244900,
      activeVendorCount: 1,
    });
  });
});

describe('ZodValidationPipe(createRmcEntrySchema)', () => {
  const pipe = new ZodValidationPipe(createRmcEntrySchema);

  const base = {
    siteId: '11111111-1111-4111-8111-111111111111',
    vendorId: '22222222-2222-4222-8222-222222222222',
    grade: 'M25',
    ratePerM3: 6200,
    totalAmount: 260400,
    deliveredAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid plain RMC delivery', () => {
    expect(() => pipe.transform({ ...base, quantityM3: 42 })).not.toThrow();
  });

  it('rejects a non-positive quantityM3 with no correctsId', () => {
    expect(() => pipe.transform({ ...base, quantityM3: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, quantityM3: -5 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a negative quantityM3 delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        quantityM3: -6,
        correctsId: '33333333-3333-4333-8333-333333333333',
        reason: 'Recount: 6 m³ short of the delivered load',
      }),
    ).not.toThrow();
  });

  it('rejects a zero-quantityM3 correction', () => {
    expect(() =>
      pipe.transform({
        ...base,
        quantityM3: 0,
        correctsId: '33333333-3333-4333-8333-333333333333',
        reason: 'Recount',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a correction with no reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        quantityM3: -6,
        correctsId: '33333333-3333-4333-8333-333333333333',
      }),
    ).toThrow(BadRequestException);
  });
});
