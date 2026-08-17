import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAssetServiceLogSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AssetServiceLogsController } from './asset-service-logs.controller';
import { AssetServiceLogsService } from './asset-service-logs.service';

describe('AssetServiceLogsController', () => {
  let controller: AssetServiceLogsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetServiceLogsController],
      providers: [{ provide: AssetServiceLogsService, useValue: service }],
    }).compile();

    controller = module.get<AssetServiceLogsController>(
      AssetServiceLogsController,
    );
  });

  it('create delegates to AssetServiceLogsService.create with the validated body', async () => {
    const input = {
      assetType: 'MACHINERY' as const,
      assetId: '11111111-1111-4111-8111-111111111111',
      kind: 'FUEL' as const,
      serviceDate: new Date('2026-08-15'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to AssetServiceLogsService.list with parsed assetType/assetId query params', async () => {
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

  it('update delegates to AssetServiceLogsService.update with id, parsed assetType, and the validated body', async () => {
    const body = { kind: 'REPAIR' as const };
    service.update.mockResolvedValue({ id: 'log1', ...body });

    const result = await controller.update('log1', 'VEHICLE', body);

    expect(service.update).toHaveBeenCalledWith('log1', 'VEHICLE', body);
    expect(result).toEqual({ id: 'log1', ...body });
  });

  it('update rejects an invalid assetType', () => {
    expect(() => controller.update('log1', 'BOAT', {})).toThrow(
      BadRequestException,
    );
  });
});

describe('ZodValidationPipe(createAssetServiceLogSchema)', () => {
  const pipe = new ZodValidationPipe(createAssetServiceLogSchema);

  const base = {
    assetType: 'MACHINERY' as const,
    assetId: '11111111-1111-4111-8111-111111111111',
    serviceDate: '2026-08-15',
  };

  it('accepts a valid FUEL entry', () => {
    expect(() => pipe.transform({ ...base, kind: 'FUEL' })).not.toThrow();
  });

  it('accepts a valid MAINTENANCE entry', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'MAINTENANCE' }),
    ).not.toThrow();
  });

  it('accepts a valid REPAIR entry', () => {
    expect(() => pipe.transform({ ...base, kind: 'REPAIR' })).not.toThrow();
  });

  it('rejects a kind outside the closed FUEL/MAINTENANCE/REPAIR set', () => {
    expect(() => pipe.transform({ ...base, kind: 'OIL_CHANGE' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects a missing kind', () => {
    expect(() => pipe.transform({ ...base })).toThrow(BadRequestException);
  });

  it('accepts optional notes and a nonnegative cost', () => {
    expect(() =>
      pipe.transform({
        ...base,
        kind: 'FUEL',
        notes: 'Filled up before site move',
        cost: 1500,
      }),
    ).not.toThrow();
  });

  it('rejects a negative cost', () => {
    expect(() => pipe.transform({ ...base, kind: 'FUEL', cost: -1 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a valid VEHICLE entry', () => {
    expect(() =>
      pipe.transform({ ...base, assetType: 'VEHICLE', kind: 'MAINTENANCE' }),
    ).not.toThrow();
  });
});
