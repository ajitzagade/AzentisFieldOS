import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMachineryTypeSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { MachineryTypesController } from './machinery-types.controller';
import { MachineryTypesService } from './machinery-types.service';

describe('MachineryTypesController', () => {
  let controller: MachineryTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachineryTypesController],
      providers: [{ provide: MachineryTypesService, useValue: service }],
    }).compile();

    controller = module.get<MachineryTypesController>(MachineryTypesController);
  });

  it('create delegates to MachineryTypesService.create with the validated body', async () => {
    const input = { name: 'Excavator' };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to MachineryTypesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Excavator' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Excavator' }]);
  });
});

describe('ZodValidationPipe(createMachineryTypeSchema)', () => {
  const pipe = new ZodValidationPipe(createMachineryTypeSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    expect(pipe.transform({ name: 'Excavator' })).toEqual({
      name: 'Excavator',
    });
  });
});

describe('MachineryTypesService.create', () => {
  function makeService(create: ReturnType<typeof vi.fn>) {
    const prisma = { machineryType: { create } };
    return new MachineryTypesService(
      prisma as unknown as ConstructorParameters<
        typeof MachineryTypesService
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

    await expect(service.create({ name: 'Excavator' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const create = vi.fn().mockRejectedValue(new Error('connection lost'));
    const service = makeService(create);

    await expect(service.create({ name: 'Excavator' })).rejects.toThrow(
      'connection lost',
    );
  });
});
