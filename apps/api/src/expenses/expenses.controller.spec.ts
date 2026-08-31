import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createExpenseSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    summary: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      summary: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: service }],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
  });

  it('create delegates to ExpensesService.create with the validated body', async () => {
    const input = {
      siteId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222222',
      amount: 5000,
      incurredAt: new Date('2026-08-13'),
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to ExpensesService.list with filters', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list(
      'site1',
      'cat1',
      '2026-08-01',
      '2026-08-31',
    );

    expect(service.list).toHaveBeenCalledWith({
      siteId: 'site1',
      categoryId: 'cat1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list forwards sort/order query params to ExpensesService.list', async () => {
    service.list.mockResolvedValue([]);

    await controller.list(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'amount',
      'desc',
    );

    expect(service.list).toHaveBeenCalledWith({
      sort: 'amount',
      order: 'desc',
    });
  });

  it('summary delegates to ExpensesService.summary', async () => {
    service.summary.mockResolvedValue({
      totalThisMonth: 0,
      totalThisWeek: 0,
      largestCategoryThisMonth: null,
    });

    await controller.summary();

    expect(service.summary).toHaveBeenCalled();
  });

  it('findOne delegates to ExpensesService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });
});

describe('ZodValidationPipe(createExpenseSchema)', () => {
  const pipe = new ZodValidationPipe(createExpenseSchema);

  const base = {
    siteId: '11111111-1111-4111-8111-111111111111',
    categoryId: '22222222-2222-4222-8222-222222222222',
    incurredAt: '2026-08-13',
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid fresh Expense with a positive amount', () => {
    expect(() => pipe.transform({ ...base, amount: 5000 })).not.toThrow();
  });

  it('rejects a non-positive amount with no correctsId', () => {
    expect(() => pipe.transform({ ...base, amount: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, amount: -5 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a negative amount delta when correctsId is set with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -500,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount: overcharged by 500',
      }),
    ).not.toThrow();
  });

  it('rejects a zero-amount correction', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: 0,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Recount',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a correction with no reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        amount: -500,
        correctsId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });
});
