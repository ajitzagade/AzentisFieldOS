import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSiteSchema, updateSiteSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Prisma } from '../generated/prisma/client';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

interface FakePrismaSite {
  update: ReturnType<typeof vi.fn>;
  findUnique?: ReturnType<typeof vi.fn>;
}

describe('SitesController', () => {
  let controller: SitesController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    getPhotos: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      findOne: vi.fn(),
      getPhotos: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [{ provide: SitesService, useValue: service }],
    }).compile();

    controller = module.get<SitesController>(SitesController);
  });

  it('create delegates to SitesService.create with the validated body', async () => {
    const input = {
      name: 'NH-48',
      location: 'Nashik',
      status: 'ACTIVE' as const,
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list delegates to SitesService.list', async () => {
    service.list.mockResolvedValue([{ id: '1', name: 'NH-48' }]);

    const result = await controller.list();

    expect(service.list).toHaveBeenCalled();
    expect(result).toEqual([{ id: '1', name: 'NH-48' }]);
  });

  it('update delegates to SitesService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'NH-48 renamed' });

    const result = await controller.update('1', { name: 'NH-48 renamed' });

    expect(service.update).toHaveBeenCalledWith('1', { name: 'NH-48 renamed' });
    expect(result).toEqual({ id: '1', name: 'NH-48 renamed' });
  });

  it('findOne delegates to SitesService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: '1', name: 'NH-48', feed: [] });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'NH-48', feed: [] });
  });

  it('getPhotos delegates to SitesService.getPhotos with the id', async () => {
    service.getPhotos.mockResolvedValue([]);

    const result = await controller.getPhotos('1');

    expect(service.getPhotos).toHaveBeenCalledWith('1');
    expect(result).toEqual([]);
  });
});

describe('ZodValidationPipe(createSiteSchema)', () => {
  const pipe = new ZodValidationPipe(createSiteSchema);

  it('rejects a body missing required fields with the documented error shape', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);

    try {
      pipe.transform({});
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        error: { code: string; details: unknown };
      };
      expect(response.error.code).toBe('VALIDATION_FAILED');
      expect(response.error.details).toBeDefined();
    }
  });

  it('accepts a valid body and defaults status to ACTIVE', () => {
    const result = pipe.transform({ name: 'NH-48', location: 'Nashik' });
    expect(result).toEqual({
      name: 'NH-48',
      location: 'Nashik',
      status: 'ACTIVE',
    });
  });
});

describe('ZodValidationPipe(updateSiteSchema)', () => {
  const pipe = new ZodValidationPipe(updateSiteSchema);

  it('accepts a partial body with only one field changed', () => {
    const result = pipe.transform({ status: 'ON_HOLD' });
    expect(result).toEqual({ status: 'ON_HOLD' });
  });

  it('accepts an empty body as a no-op update', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('still enforces per-field rules when a field is present', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});

describe('SitesService.update', () => {
  function makeService(prismaSiteUpdate: ReturnType<typeof vi.fn>) {
    const prisma: { site: FakePrismaSite } = {
      site: { update: prismaSiteUpdate },
    };
    return new SitesService(
      prisma as unknown as ConstructorParameters<typeof SitesService>[0],
      {} as ConstructorParameters<typeof SitesService>[1],
    );
  }

  function p2025Error(): InstanceType<
    typeof Prisma.PrismaClientKnownRequestError
  > {
    const error = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as InstanceType<typeof Prisma.PrismaClientKnownRequestError>;
    return Object.assign(error, {
      code: 'P2025',
      message:
        'An operation failed because it depends on one or more records that were required but not found.',
    });
  }

  it('updates the Site and returns the result', async () => {
    const update = vi
      .fn()
      .mockResolvedValue({ id: '1', name: 'NH-48 renamed' });
    const service = makeService(update);

    const result = await service.update('1', { name: 'NH-48 renamed' });

    expect(update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'NH-48 renamed' },
    });
    expect(result).toEqual({ id: '1', name: 'NH-48 renamed' });
  });

  it('throws NotFoundException, not a raw 500, when Prisma reports P2025 (record not found)', async () => {
    const update = vi.fn().mockRejectedValue(p2025Error());
    const service = makeService(update);

    await expect(service.update('missing-id', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('re-throws any other error unchanged', async () => {
    const otherError = new Error('connection lost');
    const update = vi.fn().mockRejectedValue(otherError);
    const service = makeService(update);

    await expect(service.update('1', { name: 'X' })).rejects.toThrow(
      'connection lost',
    );
  });
});

describe('SitesService.findOne', () => {
  function emptyFindMany() {
    return vi.fn().mockResolvedValue([]);
  }

  function makeService(findUnique: ReturnType<typeof vi.fn>) {
    const prisma = {
      site: { findUnique },
      purchase: { findMany: emptyFindMany() },
      movement: { findMany: emptyFindMany() },
      consumption: { findMany: emptyFindMany() },
      returnWastage: { findMany: emptyFindMany() },
      workRecord: { findMany: emptyFindMany() },
      expense: { findMany: emptyFindMany() },
      rmcEntry: { findMany: emptyFindMany() },
      dailySiteReport: { findMany: emptyFindMany() },
      machineryMovementLog: { findMany: emptyFindMany() },
      vehicleMovementLog: { findMany: emptyFindMany() },
      wasteDisposal: { findMany: emptyFindMany() },
    };
    return new SitesService(
      prisma as unknown as ConstructorParameters<typeof SitesService>[0],
      {} as ConstructorParameters<typeof SitesService>[1],
    );
  }

  it('throws NotFoundException for a Site ID that does not exist', async () => {
    const service = makeService(vi.fn().mockResolvedValue(null));

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns the Site merged with its (possibly empty) activity feed', async () => {
    const service = makeService(
      vi.fn().mockResolvedValue({ id: '1', name: 'NH-48' }),
    );

    const result = await service.findOne('1');

    expect(result).toEqual({ id: '1', name: 'NH-48', feed: [] });
  });
});
