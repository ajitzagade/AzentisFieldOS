import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMaterialCategorySchema,
  updateMaterialCategorySchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { MaterialCategoriesController } from './material-categories.controller';
import { MaterialCategoriesService } from './material-categories.service';

interface FakePrismaMaterialCategory {
  create?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}

describe('MaterialCategoriesController', () => {
  let controller: MaterialCategoriesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialCategoriesController],
      providers: [{ provide: MaterialCategoriesService, useValue: service }],
    }).compile();

    controller = module.get<MaterialCategoriesController>(
      MaterialCategoriesController,
    );
  });

  it('create delegates to MaterialCategoriesService.create with the validated body', async () => {
    const input = { name: 'Cement' };
    service.create.mockResolvedValue({ id: '1', ...input, isActive: true });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input, isActive: true });
  });

  it('list delegates to MaterialCategoriesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'Cement' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'Cement' }]);
  });

  it('update delegates to MaterialCategoriesService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
  });
});

describe('ZodValidationPipe(createMaterialCategorySchema)', () => {
  const pipe = new ZodValidationPipe(createMaterialCategorySchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    expect(pipe.transform({ name: 'Cement' })).toEqual({ name: 'Cement' });
  });
});

describe('ZodValidationPipe(updateMaterialCategorySchema)', () => {
  const pipe = new ZodValidationPipe(updateMaterialCategorySchema);

  it('accepts an empty body as a true no-op — does not silently re-enable isActive', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a partial body with only isActive set', () => {
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });

  it('still enforces per-field rules when a field is present', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});

describe('MaterialCategoriesService', () => {
  function makeService(prismaMaterialCategory: FakePrismaMaterialCategory) {
    const prisma: { materialCategory: FakePrismaMaterialCategory } = {
      materialCategory: prismaMaterialCategory,
    };
    return new MaterialCategoriesService(
      prisma as unknown as ConstructorParameters<
        typeof MaterialCategoriesService
      >[0],
    );
  }

  function p2025Error(): InstanceType<
    typeof Prisma.PrismaClientKnownRequestError
  > {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, { code: 'P2025', message: 'Record not found' });
  }

  function p2002Error(): InstanceType<
    typeof Prisma.PrismaClientKnownRequestError
  > {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, {
      code: 'P2002',
      message: 'Unique constraint failed',
    });
  }

  it('update() throws NotFoundException, not a raw 500, when Prisma reports P2025', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const service = makeService({ update });

    await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const update = vi.fn().mockRejectedValue(otherError);
    const service = makeService({ update });

    await expect(service.update('1', { name: 'X' })).rejects.toThrow(
      'connection lost',
    );
  });

  it('create() translates a duplicate-name P2002 into a clear 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const service = makeService({ create });

    await expect(service.create({ name: 'Cement' })).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create({ name: 'Cement' })).rejects.toThrow(
      'A Material Category with this name already exists',
    );
  });

  it('update() translates a duplicate-name P2002 into a clear 400, not a raw 500', async () => {
    const update = vi.fn().mockRejectedValue(p2002Error());
    const service = makeService({ update });

    await expect(service.update('1', { name: 'Cement' })).rejects.toThrow(
      BadRequestException,
    );
  });
});
