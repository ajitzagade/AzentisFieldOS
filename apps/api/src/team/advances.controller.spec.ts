import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdvanceSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdvancesController } from './advances.controller';
import { AdvancesService } from './advances.service';

describe('AdvancesController', () => {
  let controller: AdvancesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvancesController],
      providers: [{ provide: AdvancesService, useValue: service }],
    }).compile();

    controller = module.get<AdvancesController>(AdvancesController);
  });

  it('create delegates to AdvancesService.create with the validated body', async () => {
    const input = {
      teamMemberId: '11111111-1111-4111-8111-111111111111',
      amount: 5000,
      givenAt: new Date('2026-08-13'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to AdvancesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('findOne delegates to AdvancesService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createAdvanceSchema)', () => {
  const pipe = new ZodValidationPipe(createAdvanceSchema);

  const base = {
    teamMemberId: '11111111-1111-4111-8111-111111111111',
    givenAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body with a positive amount', () => {
    expect(() => pipe.transform({ ...base, amount: 5000 })).not.toThrow();
  });

  it('rejects a non-positive amount with no correctsId', () => {
    expect(() => pipe.transform({ ...base, amount: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, amount: -5000 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a negative amount delta when correctsId is set with a correctionReason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -2000,
        correctsId: '44444444-4444-4444-8444-444444444444',
        correctionReason: 'Recorded in error',
      }),
    ).not.toThrow();
  });

  it('rejects a correction with no correctionReason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -2000,
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
