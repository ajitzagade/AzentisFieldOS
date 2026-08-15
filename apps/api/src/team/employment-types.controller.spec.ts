import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmploymentTypeSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { EmploymentTypesController } from './employment-types.controller';
import { EmploymentTypesService } from './employment-types.service';

describe('EmploymentTypesController', () => {
  let controller: EmploymentTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn() };

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
