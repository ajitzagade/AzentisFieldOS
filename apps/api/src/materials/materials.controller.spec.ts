import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMaterialSchema,
  createMaterialSizeSchema,
  updateMaterialSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';

const validUuid = '123e4567-e89b-42d3-a456-426614174000';

interface FakePrismaMaterial {
  create?: ReturnType<typeof vi.fn>;
  update?: ReturnType<typeof vi.fn>;
}

interface FakePrismaMaterialSize {
  create?: ReturnType<typeof vi.fn>;
  findMany?: ReturnType<typeof vi.fn>;
}

describe('MaterialsController', () => {
  let controller: MaterialsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    createSize: ReturnType<typeof vi.fn>;
    listSizes: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      createSize: vi.fn(),
      listSizes: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialsController],
      providers: [{ provide: MaterialsService, useValue: service }],
    }).compile();

    controller = module.get<MaterialsController>(MaterialsController);
  });

  it('create delegates to MaterialsService.create with the validated body', async () => {
    const input = {
      name: 'RCC Pipe',
      categoryId: validUuid,
      unitId: validUuid,
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to MaterialsService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'RCC Pipe' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'RCC Pipe' }]);
  });

  it('update delegates to MaterialsService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', isActive: false });

    const result = await controller.update('1', { isActive: false });

    expect(service.update).toHaveBeenCalledWith('1', { isActive: false });
    expect(result).toEqual({ id: '1', isActive: false });
  });

  it('createSize delegates to MaterialsService.createSize with the materialId and validated body', async () => {
    service.createSize.mockResolvedValue({
      id: 's1',
      materialId: 'mat-1',
      label: '300mm',
    });

    const result = await controller.createSize('mat-1', { label: '300mm' });

    expect(service.createSize).toHaveBeenCalledWith('mat-1', {
      label: '300mm',
    });
    expect(result).toEqual({ id: 's1', materialId: 'mat-1', label: '300mm' });
  });

  it('listSizes delegates to MaterialsService.listSizes with the materialId', async () => {
    service.listSizes.mockResolvedValue([{ id: 's1', label: '300mm' }]);

    const result = await controller.listSizes('mat-1');

    expect(service.listSizes).toHaveBeenCalledWith('mat-1');
    expect(result).toEqual([{ id: 's1', label: '300mm' }]);
  });
});

describe('ZodValidationPipe(createMaterialSizeSchema)', () => {
  const pipe = new ZodValidationPipe(createMaterialSizeSchema);

  it('rejects a body missing label', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    expect(pipe.transform({ label: '300mm' })).toEqual({ label: '300mm' });
  });
});

describe('ZodValidationPipe(createMaterialSchema)', () => {
  const pipe = new ZodValidationPipe(createMaterialSchema);

  it('rejects a body missing required fields', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('rejects a non-uuid categoryId/unitId', () => {
    expect(() =>
      pipe.transform({
        name: 'RCC Pipe',
        categoryId: 'not-a-uuid',
        unitId: validUuid,
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a valid body', () => {
    const result = pipe.transform({
      name: 'RCC Pipe',
      categoryId: validUuid,
      unitId: validUuid,
    });
    expect(result).toEqual({
      name: 'RCC Pipe',
      categoryId: validUuid,
      unitId: validUuid,
    });
  });
});

describe('ZodValidationPipe(updateMaterialSchema)', () => {
  const pipe = new ZodValidationPipe(updateMaterialSchema);

  it('accepts an empty body as a true no-op — does not silently re-enable isActive', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('accepts a partial body with only isActive set', () => {
    expect(pipe.transform({ isActive: false })).toEqual({ isActive: false });
  });

  it('accepts a valid customFields array', () => {
    const customFields = [{ label: 'Brand', type: 'TEXT' as const }];
    expect(pipe.transform({ customFields })).toEqual({ customFields });
  });

  it('accepts an empty customFields array', () => {
    expect(pipe.transform({ customFields: [] })).toEqual({ customFields: [] });
  });

  it('rejects an unknown customFields type', () => {
    expect(() =>
      pipe.transform({ customFields: [{ label: 'Brand', type: 'STRING' }] }),
    ).toThrow(BadRequestException);
  });

  it('rejects more than 20 customFields entries', () => {
    const customFields = Array.from({ length: 21 }, (_, i) => ({
      label: `Field ${i}`,
      type: 'TEXT' as const,
    }));
    expect(() => pipe.transform({ customFields })).toThrow(BadRequestException);
  });

  it('accepts a positive lowStockThreshold', () => {
    expect(pipe.transform({ lowStockThreshold: 200 })).toEqual({
      lowStockThreshold: 200,
    });
  });

  it('accepts null to clear the lowStockThreshold (FR-36: no threshold means never flagged)', () => {
    expect(pipe.transform({ lowStockThreshold: null })).toEqual({
      lowStockThreshold: null,
    });
  });

  it('rejects a non-positive lowStockThreshold', () => {
    expect(() => pipe.transform({ lowStockThreshold: 0 })).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform({ lowStockThreshold: -5 })).toThrow(
      BadRequestException,
    );
  });
});

describe('MaterialsService', () => {
  function makeService(
    prismaMaterial: FakePrismaMaterial,
    prismaMaterialSize: FakePrismaMaterialSize = {},
  ) {
    const prisma = {
      material: prismaMaterial,
      materialSize: prismaMaterialSize,
    };
    return new MaterialsService(
      prisma as unknown as ConstructorParameters<typeof MaterialsService>[0],
    );
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

  function p2003Error(): InstanceType<
    typeof Prisma.PrismaClientKnownRequestError
  > {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, {
      code: 'P2003',
      message: 'Foreign key constraint violated',
    });
  }

  function p2025Error(): InstanceType<
    typeof Prisma.PrismaClientKnownRequestError
  > {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, { code: 'P2025', message: 'Record not found' });
  }

  it('create() translates a P2003 foreign-key violation (missing Category/Unit) into a 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2003Error());
    const service = makeService({ create });

    await expect(
      service.create({
        name: 'RCC Pipe',
        categoryId: 'missing',
        unitId: validUuid,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('create() translates a duplicate (categoryId, name) P2002 into a clear 400, not a raw 500', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const service = makeService({ create });

    await expect(
      service.create({
        name: 'RCC Pipe',
        categoryId: validUuid,
        unitId: validUuid,
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create({
        name: 'RCC Pipe',
        categoryId: validUuid,
        unitId: validUuid,
      }),
    ).rejects.toThrow(
      'A Material with this name already exists in this Category',
    );
  });

  it('create() re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const create = vi.fn().mockRejectedValue(otherError);
    const service = makeService({ create });

    await expect(
      service.create({
        name: 'RCC Pipe',
        categoryId: validUuid,
        unitId: validUuid,
      }),
    ).rejects.toThrow('connection lost');
  });

  it('update() translates P2025 into NotFoundException', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const service = makeService({ update });

    await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update() translates P2003 into BadRequestException', async () => {
    const update = vi.fn().mockRejectedValue(p2003Error());
    const service = makeService({ update });

    await expect(
      service.update('1', { categoryId: 'missing' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('update() translates a duplicate (categoryId, name) P2002 into a clear 400, not a raw 500', async () => {
    const update = vi.fn().mockRejectedValue(p2002Error());
    const service = makeService({ update });

    await expect(service.update('1', { name: 'RCC Pipe' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('createSize() translates a duplicate (materialId, label) P2002 into a clear 400, not a raw constraint string', async () => {
    const create = vi.fn().mockRejectedValue(p2002Error());
    const service = makeService({}, { create });

    await expect(
      service.createSize('mat-1', { label: '300mm' }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.createSize('mat-1', { label: '300mm' }),
    ).rejects.toThrow('This Size already exists for this Material');
  });

  it('createSize() translates a P2003 (materialId does not exist) into a 400', async () => {
    const create = vi.fn().mockRejectedValue(p2003Error());
    const service = makeService({}, { create });

    await expect(
      service.createSize('missing-material', { label: '300mm' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('createSize() re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const create = vi.fn().mockRejectedValue(otherError);
    const service = makeService({}, { create });

    await expect(
      service.createSize('mat-1', { label: '300mm' }),
    ).rejects.toThrow('connection lost');
  });

  it('update() round-trips customFields correctly when updating them', async () => {
    const customFields = [{ label: 'Brand', type: 'TEXT' as const }];
    const update = vi.fn().mockResolvedValue({ id: '1', customFields });
    const service = makeService({ update });

    const result = await service.update('1', { customFields });

    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { customFields },
    });
    expect(result.customFields).toEqual(customFields);
  });

  it('update() normalizes a legacy {} customFields default to [] in the response, not null or a thrown error', async () => {
    const update = vi.fn().mockResolvedValue({ id: '1', customFields: {} });
    const service = makeService({ update });

    const result = await service.update('1', { name: 'Renamed' });

    expect(result.customFields).toEqual([]);
  });

  it('create() normalizes a legacy {} customFields default to [] in the response', async () => {
    const create = vi.fn().mockResolvedValue({ id: '1', customFields: {} });
    const service = makeService({ create });

    const result = await service.create({
      name: 'RCC Pipe',
      categoryId: validUuid,
      unitId: validUuid,
    });

    expect(result.customFields).toEqual([]);
  });

  it("list() normalizes each Material's legacy {} customFields default to []", async () => {
    const prisma = {
      material: {
        findMany: vi.fn().mockResolvedValue([
          { id: '1', customFields: {} },
          { id: '2', customFields: [{ label: 'Brand', type: 'TEXT' }] },
        ]),
      },
    };
    const service = new MaterialsService(
      prisma as unknown as ConstructorParameters<typeof MaterialsService>[0],
    );

    const result = await service.list();

    expect(result[0]?.customFields).toEqual([]);
    expect(result[1]?.customFields).toEqual([{ label: 'Brand', type: 'TEXT' }]);
  });

  it('listSizes() returns the Sizes for a Material, ordered by label', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 's1', label: '300mm' }]);
    const service = makeService({}, { findMany });

    const result = await service.listSizes('mat-1');

    expect(findMany).toHaveBeenCalledWith({
      where: { materialId: 'mat-1' },
      orderBy: { label: 'asc' },
    });
    expect(result).toEqual([{ id: 's1', label: '300mm' }]);
  });
});
