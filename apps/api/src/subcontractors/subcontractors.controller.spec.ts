import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createSubcontractorSchema,
  updateSubcontractorSchema,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ROLES_KEY } from '../auth/roles.decorator';
import { SubcontractorsController } from './subcontractors.controller';
import { SubcontractorsService } from './subcontractors.service';

describe('SubcontractorsController', () => {
  let controller: SubcontractorsController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    contracts: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      findOne: vi.fn(),
      contracts: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcontractorsController],
      providers: [{ provide: SubcontractorsService, useValue: service }],
    }).compile();

    controller = module.get<SubcontractorsController>(SubcontractorsController);
  });

  it('create delegates to SubcontractorsService.create with the validated body', async () => {
    const input = {
      name: 'Ganesh Pipeline Works',
      workCategories: ['Pipe laying'],
    };
    service.create.mockResolvedValue({ id: '1', ...input });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: '1', ...input });
  });

  it('list forwards q/page/pageSize/sort/order query params to SubcontractorsService.list as one object', async () => {
    service.list.mockResolvedValue([]);

    await controller.list('ganesh', '2', '10', 'phone', 'desc');

    expect(service.list).toHaveBeenCalledWith({
      q: 'ganesh',
      page: '2',
      pageSize: '10',
      sort: 'phone',
      order: 'desc',
    });
  });

  it('update delegates to SubcontractorsService.update with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: '1', name: 'Renamed Works' });

    const result = await controller.update('1', { name: 'Renamed Works' });

    expect(service.update).toHaveBeenCalledWith('1', { name: 'Renamed Works' });
    expect(result).toEqual({ id: '1', name: 'Renamed Works' });
  });

  it('findOne delegates to SubcontractorsService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({
      id: '1',
      name: 'Ganesh Pipeline Works',
    });

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual({ id: '1', name: 'Ganesh Pipeline Works' });
  });

  it('contracts delegates to SubcontractorsService.contracts with the id', async () => {
    service.contracts.mockResolvedValue([{ id: 'c1' }]);

    const result = await controller.contracts('1');

    expect(service.contracts).toHaveBeenCalledWith('1');
    expect(result).toEqual([{ id: 'c1' }]);
  });
});

// Reading decorator metadata off a method reference (never invoking it) is
// safe — see the established pattern for these authorization-wiring tests
// in subcontractors-soft-delete.spec.ts / site-contracts.controller.spec.ts.
/* eslint-disable @typescript-eslint/unbound-method */
describe('SubcontractorsController authorization wiring', () => {
  const reflector = new Reflector();

  it('create/update carry their own OWNER_ADMIN restriction — FR-55', () => {
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.create),
    ).toEqual(['OWNER_ADMIN']);
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.update),
    ).toEqual(['OWNER_ADMIN']);
  });

  it('list/findOne/contracts carry no @Roles() metadata — open to both roles for entry-form pickers', () => {
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.list),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.findOne),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.contracts),
    ).toBeUndefined();
  });

  it('remove keeps its existing OWNER_ADMIN restriction (soft delete)', () => {
    expect(
      reflector.get(ROLES_KEY, SubcontractorsController.prototype.remove),
    ).toEqual(['OWNER_ADMIN']);
  });
});

describe('ZodValidationPipe(createSubcontractorSchema)', () => {
  const pipe = new ZodValidationPipe(createSubcontractorSchema);

  it('rejects a body missing the required name', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);
  });

  it('accepts a minimal body and defaults workCategories to an empty array', () => {
    const result = pipe.transform({ name: 'Ganesh Pipeline Works' });
    expect(result).toEqual({
      name: 'Ganesh Pipeline Works',
      workCategories: [],
    });
  });

  it('accepts workCategories as a list of discrete tags', () => {
    const result = pipe.transform({
      name: 'Ganesh Pipeline Works',
      workCategories: ['Pipe laying', 'Trenching'],
    });
    expect(result).toEqual({
      name: 'Ganesh Pipeline Works',
      workCategories: ['Pipe laying', 'Trenching'],
    });
  });

  it('rejects an empty-string workCategories item', () => {
    expect(() =>
      pipe.transform({ name: 'Ganesh Pipeline Works', workCategories: [''] }),
    ).toThrow(BadRequestException);
  });

  it('rejects an invalid email', () => {
    expect(() =>
      pipe.transform({ name: 'Ganesh Pipeline Works', email: 'not-an-email' }),
    ).toThrow(BadRequestException);
  });
});

describe('ZodValidationPipe(updateSubcontractorSchema)', () => {
  const pipe = new ZodValidationPipe(updateSubcontractorSchema);

  it('accepts a partial body with only one field changed', () => {
    const result = pipe.transform({ phone: '+91 98220 55671' });
    expect(result).toEqual({ phone: '+91 98220 55671' });
  });

  it('accepts an empty body as a no-op update', () => {
    expect(pipe.transform({})).toEqual({});
  });

  it('does not silently reset workCategories to [] when the field is omitted', () => {
    const result = pipe.transform({ name: 'Renamed Works' });
    expect(result).not.toHaveProperty('workCategories');
  });

  it('still enforces per-field rules when a field is present', () => {
    expect(() => pipe.transform({ name: '' })).toThrow(BadRequestException);
  });
});
