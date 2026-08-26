import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMachineryTypeSchema,
  updateMachineryTypeSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { MachineryTypesController } from './machinery-types.controller';
import { MachineryTypesService } from './machinery-types.service';

describe('MachineryTypesController', () => {
  let controller: MachineryTypesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MachineryTypesController],
      providers: [{ provide: MachineryTypesService, useValue: service }],
    }).compile();

    controller = module.get<MachineryTypesController>(MachineryTypesController);
  });

  it('update delegates to MachineryTypesService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
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

describe('ZodValidationPipe(updateMachineryTypeSchema)', () => {
  const pipe = new ZodValidationPipe(updateMachineryTypeSchema);

  it('accepts an empty body as a true no-op', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a rename-only and a disable-only body', () => {
    expect(pipe.transform({ name: 'Loader' })).toEqual({ name: 'Loader' });
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });

  it('rejects an empty name', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});

describe('MachineryTypesService.update (Story 14.3 rename/disable)', () => {
  function makeService(update: ReturnType<typeof vi.fn>) {
    const prisma = { machineryType: { update } };
    return new MachineryTypesService(
      prisma as unknown as ConstructorParameters<
        typeof MachineryTypesService
      >[0],
    );
  }

  function knownError(code: string) {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, { code, message: code });
  }

  it('renames and disables via prisma.machineryType.update', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', name: 'Loader' });
    const service = makeService(update);

    await service.update('1', { name: 'Loader' });
    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Loader' },
    });

    await service.update('1', { isActive: false });
    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { isActive: false },
    });
  });

  it('throws NotFoundException on P2025', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2025'));
    const service = makeService(update);

    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('translates a duplicate-name P2002 into a 400', async () => {
    const update = vi.fn().mockRejectedValue(knownError('P2002'));
    const service = makeService(update);

    await expect(service.update('1', { name: 'Excavator' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
