import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdvanceAdjustmentSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdvanceAdjustmentsController } from './advance-adjustments.controller';
import { AdvanceAdjustmentsService } from './advance-adjustments.service';

describe('AdvanceAdjustmentsController', () => {
  let controller: AdvanceAdjustmentsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvanceAdjustmentsController],
      providers: [{ provide: AdvanceAdjustmentsService, useValue: service }],
    }).compile();

    controller = module.get<AdvanceAdjustmentsController>(
      AdvanceAdjustmentsController,
    );
  });

  it('create delegates to AdvanceAdjustmentsService.create with the validated body', async () => {
    const input = {
      advanceId: '11111111-1111-4111-8111-111111111111',
      amount: 3000,
      adjustedAt: new Date('2026-08-13'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to AdvanceAdjustmentsService.list with no filters when none are given', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalledWith({
      teamMemberId: undefined,
      page: undefined,
      pageSize: undefined,
    });
    expect(result).toEqual([{ id: '1' }]);
  });

  it("list forwards teamMemberId to AdvanceAdjustmentsService.list, so a regression here cannot leak every Team Member into one person's ledger", async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    await controller.list('tm1');

    expect(service.list).toHaveBeenCalledWith({
      teamMemberId: 'tm1',
      page: undefined,
      pageSize: undefined,
    });
  });

  it('findOne delegates to AdvanceAdjustmentsService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createAdvanceAdjustmentSchema)', () => {
  const pipe = new ZodValidationPipe(createAdvanceAdjustmentSchema);

  const base = {
    advanceId: '11111111-1111-4111-8111-111111111111',
    adjustedAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body with a positive amount', () => {
    expect(() => pipe.transform({ ...base, amount: 3000 })).not.toThrow();
  });

  it('rejects a non-positive amount with no correctsId', () => {
    expect(() => pipe.transform({ ...base, amount: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, amount: -3000 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a negative amount delta when correctsId is set with a correctionReason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -1000,
        correctsId: '44444444-4444-4444-8444-444444444444',
        correctionReason: 'Recorded in error',
      }),
    ).not.toThrow();
  });

  it('rejects a correction with no correctionReason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -1000,
        correctsId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a zero amount delta on a correction', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: 0,
        correctsId: '44444444-4444-4444-8444-444444444444',
        correctionReason: 'x',
      }),
    ).toThrow(BadRequestException);
  });
});
