import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubcontractorPaymentSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ROLES_KEY } from '../auth/roles.decorator';
import { SubcontractorPaymentsController } from './subcontractor-payments.controller';
import { SubcontractorPaymentsService } from './subcontractor-payments.service';

describe('SubcontractorPaymentsController', () => {
  let controller: SubcontractorPaymentsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcontractorPaymentsController],
      providers: [{ provide: SubcontractorPaymentsService, useValue: service }],
    }).compile();
    controller = module.get<SubcontractorPaymentsController>(
      SubcontractorPaymentsController,
    );
  });

  it('create delegates to SubcontractorPaymentsService.create with the validated body and current user id', async () => {
    const input = {
      siteContractId: 'c1',
      type: 'ADVANCE',
      amount: 50000,
      paidAt: new Date(),
    };
    service.create.mockResolvedValue({ id: 'p1', ...input });

    const result = await controller.create(
      { id: 'u1', role: 'OWNER_ADMIN' } as never,
      input as never,
    );

    expect(service.create).toHaveBeenCalledWith(input, 'u1');
    expect(result).toEqual({ id: 'p1', ...input });
  });

  it('list forwards siteContractId to SubcontractorPaymentsService.list', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('c1');

    expect(service.list).toHaveBeenCalledWith({ siteContractId: 'c1' });
  });
});

describe('SubcontractorPaymentsController authorization wiring', () => {
  it('carries OWNER_ADMIN metadata at the class level, covering create and list', () => {
    const reflector = new Reflector();
    expect(
      reflector.get<string[]>(ROLES_KEY, SubcontractorPaymentsController),
    ).toEqual(['OWNER_ADMIN']);
  });
});

describe('ZodValidationPipe(createSubcontractorPaymentSchema)', () => {
  const pipe = new ZodValidationPipe(createSubcontractorPaymentSchema);
  const VALID_UUID = '11111111-1111-4111-8111-111111111111';

  it('accepts a valid Advance', () => {
    const result = pipe.transform({
      siteContractId: VALID_UUID,
      type: 'ADVANCE',
      amount: 50000,
      paidAt: '2026-08-10',
    });
    expect(result).toMatchObject({ type: 'ADVANCE', amount: 50000 });
  });

  it('rejects an unknown type', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        type: 'REFUND',
        amount: 100,
        paidAt: '2026-08-10',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a non-positive amount on a non-correction entry', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        type: 'PAYMENT',
        amount: 0,
        paidAt: '2026-08-10',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a negative delta on a correction, and requires a reason', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        type: 'PAYMENT',
        amount: -1000,
        paidAt: '2026-08-10',
        correctsId: VALID_UUID,
      }),
    ).toThrow(BadRequestException);

    const result = pipe.transform({
      siteContractId: VALID_UUID,
      type: 'PAYMENT',
      amount: -1000,
      paidAt: '2026-08-10',
      correctsId: VALID_UUID,
      reason: 'Overpaid',
    });
    expect(result).toMatchObject({ amount: -1000 });
  });
});
