import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  confirmMovementReceiptSchema,
  createMovementSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';

describe('MovementsController', () => {
  let controller: MovementsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    confirmReceipt: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      confirmReceipt: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementsController],
      providers: [{ provide: MovementsService, useValue: service }],
    }).compile();

    controller = module.get<MovementsController>(MovementsController);
  });

  it('create delegates to MovementsService.create with the validated body', async () => {
    const input = {
      kind: 'GODOWN_TO_SITE' as const,
      materialSizeId: '22222222-2222-4222-8222-222222222222',
      destinationSiteId: '33333333-3333-4333-8333-333333333333',
      sentQuantity: 100,
      movedAt: '2026-08-13',
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('confirmReceipt delegates to MovementsService.confirmReceipt with id and validated body', async () => {
    service.confirmReceipt.mockResolvedValue({ id: '1', receivedQuantity: 90 });

    const result = await controller.confirmReceipt('1', {
      receivedQuantity: 90,
    });

    expect(service.confirmReceipt).toHaveBeenCalledWith('1', {
      receivedQuantity: 90,
    });
    expect(result).toEqual({ id: '1', receivedQuantity: 90 });
  });

  it('list delegates to MovementsService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne delegates to MovementsService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createMovementSchema)', () => {
  const pipe = new ZodValidationPipe(createMovementSchema);

  const base = {
    materialSizeId: '22222222-2222-4222-8222-222222222222',
    destinationSiteId: '33333333-3333-4333-8333-333333333333',
    sentQuantity: 100,
    movedAt: '2026-08-13',
  };

  it('accepts a valid GODOWN_TO_SITE body with no sourceSiteId', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'GODOWN_TO_SITE' }),
    ).not.toThrow();
  });

  it('rejects a GODOWN_TO_SITE body that includes a sourceSiteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        kind: 'GODOWN_TO_SITE',
        sourceSiteId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a SITE_TO_SITE body missing sourceSiteId', () => {
    expect(() => pipe.transform({ ...base, kind: 'SITE_TO_SITE' })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a valid SITE_TO_SITE body with a sourceSiteId', () => {
    expect(() =>
      pipe.transform({
        ...base,
        kind: 'SITE_TO_SITE',
        sourceSiteId: '44444444-4444-4444-8444-444444444444',
      }),
    ).not.toThrow();
  });

  it('rejects a non-positive sentQuantity with no correctsId', () => {
    expect(() =>
      pipe.transform({ ...base, kind: 'GODOWN_TO_SITE', sentQuantity: 0 }),
    ).toThrow(BadRequestException);
  });

  it('accepts a negative sentQuantity delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        kind: 'GODOWN_TO_SITE',
        sentQuantity: -10,
        correctsId: '55555555-5555-4555-8555-555555555555',
        reason: 'Recount',
      }),
    ).not.toThrow();
  });
});

describe('ZodValidationPipe(confirmMovementReceiptSchema)', () => {
  const pipe = new ZodValidationPipe(confirmMovementReceiptSchema);

  it('rejects a negative receivedQuantity', () => {
    expect(() => pipe.transform({ receivedQuantity: -1 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts zero and positive receivedQuantity', () => {
    expect(() => pipe.transform({ receivedQuantity: 0 })).not.toThrow();
    expect(() => pipe.transform({ receivedQuantity: 90 })).not.toThrow();
  });
});
