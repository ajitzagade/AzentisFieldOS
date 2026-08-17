import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMachinerySchema,
  updateMachinerySchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MachineryController } from './machinery.controller';
import { MachineryService } from './machinery.service';

const validUuid = '123e4567-e89b-42d3-a456-426614174000';

describe('MachineryController', () => {
  let controller: MachineryController;
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
      controllers: [MachineryController],
      providers: [{ provide: MachineryService, useValue: service }],
    }).compile();

    controller = module.get<MachineryController>(MachineryController);
  });

  it('create delegates to MachineryService.create with the validated body', async () => {
    const input = {
      name: 'JCB 3DX',
      typeId: validUuid,
      assetNumber: 'AST-001',
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to MachineryService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'JCB 3DX' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'JCB 3DX' }]);
  });

  it('findOne delegates to MachineryService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: '1', name: 'JCB 3DX' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'JCB 3DX' });
  });

  it('update delegates to MachineryService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'Renamed' });

    const result = await controller.update('1', { name: 'Renamed' });

    expect(service.update).toHaveBeenCalledWith('1', { name: 'Renamed' });
    expect(result).toEqual({ id: '1', name: 'Renamed' });
  });
});

describe('ZodValidationPipe(createMachinerySchema)', () => {
  const pipe = new ZodValidationPipe(createMachinerySchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('rejects a non-uuid typeId', () => {
    expect(() =>
      pipe.transform({
        name: 'JCB 3DX',
        typeId: 'not-a-uuid',
        assetNumber: 'AST-001',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a valid body with only the required fields', () => {
    const result = pipe.transform({
      name: 'JCB 3DX',
      typeId: validUuid,
      assetNumber: 'AST-001',
    });
    expect(result).toEqual({
      name: 'JCB 3DX',
      typeId: validUuid,
      assetNumber: 'AST-001',
    });
  });

  it('accepts optional model/ownership/operator', () => {
    expect(() =>
      pipe.transform({
        name: 'JCB 3DX',
        typeId: validUuid,
        assetNumber: 'AST-001',
        model: '3DX',
        ownership: 'Owned',
        operator: 'Ramesh',
      }),
    ).not.toThrow();
  });

  it('never validates currentStatus/currentSiteId — those fields are absent from the schema entirely', () => {
    const result = pipe.transform({
      name: 'JCB 3DX',
      typeId: validUuid,
      assetNumber: 'AST-001',
      currentStatus: 'AT_SITE',
      currentSiteId: validUuid,
    }) as Record<string, unknown>;
    expect(result).not.toHaveProperty('currentStatus');
    expect(result).not.toHaveProperty('currentSiteId');
  });
});

describe('ZodValidationPipe(updateMachinerySchema)', () => {
  const pipe = new ZodValidationPipe(updateMachinerySchema);

  it('accepts an empty body as a true no-op', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a partial body with only name set', () => {
    expect(pipe.transform({ name: 'Renamed' })).toEqual({ name: 'Renamed' });
  });

  it('accepts null to clear an optional field (full-replace PATCH)', () => {
    expect(pipe.transform({ model: null })).toEqual({ model: null });
  });

  it('strips currentStatus/currentSiteId even when partial — those fields are absent from the schema entirely', () => {
    const result = pipe.transform({
      name: 'Renamed',
      currentStatus: 'MAINTENANCE',
      currentSiteId: validUuid,
    }) as Record<string, unknown>;
    expect(result).not.toHaveProperty('currentStatus');
    expect(result).not.toHaveProperty('currentSiteId');
  });
});
