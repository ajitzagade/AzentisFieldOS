import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSubcontractorWorkEntrySchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ROLES_KEY } from '../auth/roles.decorator';
import { WorkEntriesController } from './work-entries.controller';
import { WorkEntriesService } from './work-entries.service';

describe('WorkEntriesController', () => {
  let controller: WorkEntriesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkEntriesController],
      providers: [{ provide: WorkEntriesService, useValue: service }],
    }).compile();
    controller = module.get<WorkEntriesController>(WorkEntriesController);
  });

  it('create delegates to WorkEntriesService.create with the validated body and the current user id', async () => {
    const input = { siteContractId: 'c1', quantity: 10, workDate: new Date() };
    service.create.mockResolvedValue({ id: 'we1', ...input });

    const result = await controller.create(
      { id: 'u1', role: 'SITE_SUPERVISOR' } as never,
      input,
    );

    expect(service.create).toHaveBeenCalledWith(input, 'u1');
    expect(result).toEqual({ id: 'we1', ...input });
  });

  it('list forwards siteContractId to WorkEntriesService.list', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('c1');

    expect(service.list).toHaveBeenCalledWith({ siteContractId: 'c1' });
  });
});

describe('WorkEntriesController authorization wiring', () => {
  it('carries no @Roles() metadata anywhere — Supervisor and Owner/Admin both write here', () => {
    const reflector = new Reflector();
    expect(reflector.get(ROLES_KEY, WorkEntriesController)).toBeUndefined();

    const createRoles = reflector.get<string[] | undefined>(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method reference, never invoking it
      WorkEntriesController.prototype.create,
    );
    expect(createRoles).toBeUndefined();
  });
});

describe('ZodValidationPipe(createSubcontractorWorkEntrySchema)', () => {
  const pipe = new ZodValidationPipe(createSubcontractorWorkEntrySchema);
  const VALID_UUID = '11111111-1111-4111-8111-111111111111';

  it('accepts a valid new entry', () => {
    const result = pipe.transform({
      siteContractId: VALID_UUID,
      quantity: 10,
      workDate: '2026-09-08',
    });
    expect(result).toMatchObject({ quantity: 10 });
  });

  it('rejects a zero or negative quantity on a non-correction entry', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        quantity: 0,
        workDate: '2026-09-08',
      }),
    ).toThrow(BadRequestException);
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        quantity: -5,
        workDate: '2026-09-08',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a negative delta on a correction, and requires a reason', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        quantity: -5,
        workDate: '2026-09-08',
        correctsId: VALID_UUID,
      }),
    ).toThrow(BadRequestException);

    const result = pipe.transform({
      siteContractId: VALID_UUID,
      quantity: -5,
      workDate: '2026-09-08',
      correctsId: VALID_UUID,
      reason: 'Miscounted',
    });
    expect(result).toMatchObject({ quantity: -5 });
  });

  it('rejects a zero-delta correction', () => {
    expect(() =>
      pipe.transform({
        siteContractId: VALID_UUID,
        quantity: 0,
        workDate: '2026-09-08',
        correctsId: VALID_UUID,
        reason: 'Miscounted',
      }),
    ).toThrow(BadRequestException);
  });
});
