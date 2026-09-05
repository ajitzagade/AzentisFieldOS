import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPaymentSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    markPaid: ReturnType<typeof vi.fn>;
    countPending: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      markPaid: vi.fn(),
      countPending: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: service }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('create delegates to PaymentsService.create with the validated body and the acting user id', async () => {
    const input = {
      teamMemberId: '11111111-1111-4111-8111-111111111111',
      basePay: 15000,
      additionalAmount: 0,
      deductions: 0,
    };
    const user = { id: 'u1', role: 'OWNER_ADMIN' } as never;
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(user, input);

    expect(service.create).toHaveBeenCalledWith(input, 'u1');
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to PaymentsService.list', async () => {
    service.list.mockResolvedValue([{ id: '1' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('list forwards q/page/pageSize/sort/order query params to PaymentsService.list as one object', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('ravi', '2', '10', 'netPayable', 'desc');

    expect(service.list).toHaveBeenCalledWith({
      q: 'ravi',
      page: '2',
      pageSize: '10',
      sort: 'netPayable',
      order: 'desc',
    });
  });

  it('findOne delegates to PaymentsService.findOne', async () => {
    service.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1' });
  });

  it('markPaid delegates to PaymentsService.markPaid with just the id', async () => {
    service.markPaid.mockResolvedValue({ id: '1', status: 'paid' });

    const result = await controller.markPaid('1');

    expect(service.markPaid).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', status: 'paid' });
  });

  it('countPending delegates to PaymentsService.countPending', async () => {
    service.countPending.mockResolvedValue(2);

    const result = await controller.countPending();

    expect(service.countPending).toHaveBeenCalled();
    expect(result).toBe(2);
  });
});

describe('ZodValidationPipe(createPaymentSchema)', () => {
  const pipe = new ZodValidationPipe(createPaymentSchema);

  const base = {
    teamMemberId: '11111111-1111-4111-8111-111111111111',
    basePay: 15000,
  };

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a minimal valid body, defaulting additionalAmount/deductions to 0', () => {
    const result = pipe.transform(base) as {
      additionalAmount: number;
      deductions: number;
    };
    expect(result.additionalAmount).toBe(0);
    expect(result.deductions).toBe(0);
  });

  it('strips a client-supplied netPayable — it is never part of the parsed output', () => {
    const result = pipe.transform({ ...base, netPayable: 999999 }) as Record<
      string,
      unknown
    >;
    expect(result).not.toHaveProperty('netPayable');
  });

  it('rejects a negative basePay/additionalAmount/deductions', () => {
    expect(() => pipe.transform({ ...base, basePay: -100 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, additionalAmount: -1 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ ...base, deductions: -1 })).toThrow(
      BadRequestException,
    );
  });

  it('accepts a valid optional advanceAdjustment sub-object', () => {
    expect(() =>
      pipe.transform({
        ...base,
        advanceAdjustment: {
          advanceId: '22222222-2222-4222-8222-222222222222',
          amount: 3000,
        },
      }),
    ).not.toThrow();
  });

  it('rejects an advanceAdjustment with a non-positive amount', () => {
    expect(() =>
      pipe.transform({
        ...base,
        advanceAdjustment: {
          advanceId: '22222222-2222-4222-8222-222222222222',
          amount: 0,
        },
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a correction with no reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        correctsId: '44444444-4444-4444-8444-444444444444',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a correction with a reason', () => {
    expect(() =>
      pipe.transform({
        ...base,
        correctsId: '44444444-4444-4444-8444-444444444444',
        reason: 'Base pay was entered incorrectly',
      }),
    ).not.toThrow();
  });
});
