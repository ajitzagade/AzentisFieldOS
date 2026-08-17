import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAssetMovementSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AssetMovementsController } from './asset-movements.controller';
import { AssetMovementsService } from './asset-movements.service';

describe('AssetMovementsController', () => {
  let controller: AssetMovementsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetMovementsController],
      providers: [{ provide: AssetMovementsService, useValue: service }],
    }).compile();

    controller = module.get<AssetMovementsController>(AssetMovementsController);
  });

  it('create delegates to AssetMovementsService.create with the validated body', async () => {
    const input = {
      assetType: 'MACHINERY' as const,
      assetId: '11111111-1111-4111-8111-111111111111',
      toStatus: 'AT_SITE' as const,
      siteId: '22222222-2222-4222-8222-222222222222',
      movedAt: new Date('2026-08-15'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to AssetMovementsService.list with parsed assetType/assetId query params', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list('MACHINERY', 'm1');

    expect(service.list).toHaveBeenCalledWith('MACHINERY', 'm1');
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list rejects an invalid assetType', () => {
    expect(() => controller.list('BOAT', 'm1')).toThrow(BadRequestException);
  });

  it('list rejects a missing assetId', () => {
    expect(() => controller.list('MACHINERY', '')).toThrow(BadRequestException);
  });
});

describe('ZodValidationPipe(createAssetMovementSchema)', () => {
  const pipe = new ZodValidationPipe(createAssetMovementSchema);

  const base = {
    assetType: 'MACHINERY' as const,
    assetId: '11111111-1111-4111-8111-111111111111',
    movedAt: '2026-08-15',
  };

  it('accepts a valid AT_SITE body with a siteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        toStatus: 'AT_SITE',
        siteId: '22222222-2222-4222-8222-222222222222',
      }),
    ).not.toThrow();
  });

  it('rejects an AT_SITE body missing siteId', () => {
    expect(() => pipe.transform({ ...base, toStatus: 'AT_SITE' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a MAINTENANCE body that includes a siteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        toStatus: 'MAINTENANCE',
        siteId: '22222222-2222-4222-8222-222222222222',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects an AVAILABLE body that includes a siteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        toStatus: 'AVAILABLE',
        siteId: '22222222-2222-4222-8222-222222222222',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a valid MAINTENANCE body with no siteId', () => {
    expect(() =>
      pipe.transform({ ...base, toStatus: 'MAINTENANCE' }),
    ).not.toThrow();
  });

  it('accepts a valid VEHICLE body', () => {
    expect(() =>
      pipe.transform({ ...base, assetType: 'VEHICLE', toStatus: 'AVAILABLE' }),
    ).not.toThrow();
  });

  it('requires a reason when correctsId is set', () => {
    expect(() =>
      pipe.transform({
        ...base,
        toStatus: 'MAINTENANCE',
        correctsId: '33333333-3333-4333-8333-333333333333',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a correction with correctsId and a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        toStatus: 'MAINTENANCE',
        correctsId: '33333333-3333-4333-8333-333333333333',
        reason: 'Was actually sent to Maintenance, not Available',
      }),
    ).not.toThrow();
  });
});
