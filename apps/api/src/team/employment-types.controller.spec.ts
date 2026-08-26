import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createEmploymentTypeSchema,
  updateEmploymentTypeSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';

describe('EmploymentTypesController', () => {
  let controller: EmploymentTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmploymentTypesController],
      providers: [{ provide: EmploymentTypesService, useValue: service }],
    }).compile();

    controller = module.get<EmploymentTypesController>(
      EmploymentTypesController,
    );
  });

  it('create delegates to EmploymentTypesService.create with the validated body', async () => {
    const input = { name: 'Contract' };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to EmploymentTypesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Monthly' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Monthly' }]);
  });

  it('update delegates to EmploymentTypesService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
  });
});

describe('ZodValidationPipe(createEmploymentTypeSchema)', () => {
  const pipe = new ZodValidationPipe(createEmploymentTypeSchema);

  it('rejects a body missing name', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    expect(pipe.transform({ name: 'Contract' })).toEqual({ name: 'Contract' });
  });
});

describe('ZodValidationPipe(updateEmploymentTypeSchema)', () => {
  const pipe = new ZodValidationPipe(updateEmploymentTypeSchema);

  it('accepts an empty body as a true no-op — does not silently re-enable isActive', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a rename-only body', () => {
    expect(pipe.transform({ name: 'Weekly' })).toEqual({ name: 'Weekly' });
  });

  it('accepts a disable-only body', () => {
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });

  it('still enforces per-field rules when a field is present', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});

describe('EmploymentTypesService.create', () => {
  function makeService(create: ReturnType<typeof vi.fn>) {
    const prisma = { employmentType: { create } };
    return new EmploymentTypesService(
      prisma as unknown as ConstructorParameters<
        typeof EmploymentTypesService
      >[0],
    );
  }

  it('translates a duplicate-name P2002 into a clear 400, not a raw 500', async () => {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    Object.assign(error, {
      code: 'P2002',
      message: 'Unique constraint failed',
    });
    const create = vi.fn().mockRejectedValue(error);
    const service = makeService(create);

    await expect(service.create({ name: 'Monthly' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create({ name: 'Monthly' })).rejects.toThrow(
      'An Employment Type with this name already exists',
    );
  });

  it('re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const create = vi.fn().mockRejectedValue(otherError);
    const service = makeService(create);

    await expect(service.create({ name: 'Monthly' })).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('EmploymentTypesService.update (Story 14.3 rename/disable)', () => {
  function makeService(update: ReturnType<typeof vi.fn>) {
    const prisma = { employmentType: { update } };
    return new EmploymentTypesService(
      prisma as unknown as ConstructorParameters<
        typeof EmploymentTypesService
      >[0],
    );
  }

  function knownError(code: string) {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, { code, message: code });
  }

  it('renames via prisma.employmentType.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', name: 'Weekly' });
    const service = makeService(update);

    const result = await service.update('1', { name: 'Weekly' });

    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Weekly' },
    });
    expect(result).toEqual({ id: '1', name: 'Weekly' });
  });

  it('disables via prisma.employmentType.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', isActive: false });
    const service = makeService(update);

    await service.update('1', { isActive: false });

    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { isActive: false },
    });
  });

  it('throws NotFoundException when Prisma reports P2025', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2025'));
    const service = makeService(update);

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('translates a duplicate-name P2002 into a clear 400', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2002'));
    const service = makeService(update);

    await expect(service.update('1', { name: 'Monthly' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
