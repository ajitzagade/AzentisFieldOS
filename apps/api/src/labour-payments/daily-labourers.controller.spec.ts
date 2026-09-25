import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { DailyLabourersController } from './daily-labourers.controller';
import { DailyLabourersService } from './daily-labourers.service';

describe('DailyLabourersController', () => {
  let controller: DailyLabourersController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    setActive: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      list: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      setActive: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLabourersController],
      providers: [{ provide: DailyLabourersService, useValue: service }],
    }).compile();
    controller = module.get<DailyLabourersController>(DailyLabourersController);
  });

  it('create delegates to the service', async () => {
    const input = {
      name: 'Ramesh Kumar',
      category: 'Mistri' as const,
      isActive: true,
    };
    service.create.mockResolvedValue({ id: 'l1' });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 'l1' });
  });

  it('list forwards all six query params to the service as one object', async () => {
    service.list.mockResolvedValue([{ id: 'l1' }]);

    const result = await controller.list(
      'mistri',
      '2',
      '10',
      'category',
      'desc',
      'true',
    );

    expect(service.list).toHaveBeenCalledWith({
      q: 'mistri',
      page: '2',
      pageSize: '10',
      sort: 'category',
      order: 'desc',
      isActive: 'true',
    });
    expect(result).toEqual([{ id: 'l1' }]);
  });

  it('list forwards undefined query params as-is when none are passed', async () => {
    service.list.mockResolvedValue([]);

    await controller.list();

    expect(service.list).toHaveBeenCalledWith({
      q: undefined,
      page: undefined,
      pageSize: undefined,
      sort: undefined,
      order: undefined,
      isActive: undefined,
    });
  });

  it('update delegates to the service with the id and validated body', async () => {
    service.update.mockResolvedValue({ id: 'l1', name: 'Renamed' });

    const result = await controller.update('l1', { name: 'Renamed' } as never);

    expect(service.update).toHaveBeenCalledWith('l1', { name: 'Renamed' });
    expect(result).toEqual({ id: 'l1', name: 'Renamed' });
  });

  it('setActive delegates to the service with the id and the boolean flag', async () => {
    service.setActive.mockResolvedValue({ id: 'l1', isActive: false });

    const result = await controller.setActive('l1', { isActive: false });

    expect(service.setActive).toHaveBeenCalledWith('l1', false);
    expect(result).toEqual({ id: 'l1', isActive: false });
  });
});

// Reading decorator metadata off a method reference (never invoking it) is
// safe — the established pattern for these authorization-wiring tests (see
// subcontractors.controller.spec.ts / site-contracts.controller.spec.ts).
/* eslint-disable @typescript-eslint/unbound-method */
describe('DailyLabourersController authorization wiring', () => {
  const reflector = new Reflector();

  it('every route carries no @Roles() metadata — open to both roles (revised 2026-09-25, user-requested: update/setActive were briefly Owner-only, now match create/list/findOne)', () => {
    expect(
      reflector.get(ROLES_KEY, DailyLabourersController.prototype.create),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, DailyLabourersController.prototype.list),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, DailyLabourersController.prototype.findOne),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, DailyLabourersController.prototype.update),
    ).toBeUndefined();
    expect(
      reflector.get(ROLES_KEY, DailyLabourersController.prototype.setActive),
    ).toBeUndefined();
  });
});
