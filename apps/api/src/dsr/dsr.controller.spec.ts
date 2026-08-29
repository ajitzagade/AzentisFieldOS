import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateDsrInput } from '@azentisfieldos/shared';
import { DsrController } from './dsr.controller';
import { DsrService } from './dsr.service';
import type { AuthUser } from '../auth/current-user.decorator';

const currentUser: AuthUser = {
  id: 'user-1',
  role: 'OWNER_ADMIN',
};

describe('DsrController', () => {
  let controller: DsrController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    correct: ReturnType<typeof vi.fn>;
    getCrewDefaults: ReturnType<typeof vi.fn>;
    listByDate: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      correct: vi.fn(),
      getCrewDefaults: vi.fn(),
      listByDate: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DsrController],
      providers: [{ provide: DsrService, useValue: service }],
    }).compile();

    controller = module.get<DsrController>(DsrController);
  });

  it('create delegates to DsrService.create with the validated body', async () => {
    const input: CreateDsrInput = {
      siteId: 'site-1',
      reportDate: '2026-08-10',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    };
    service.create.mockResolvedValue({ id: 'dsr-1', ...input });

    const result = await controller.create(currentUser, input);

    expect(service.create).toHaveBeenCalledWith(input, currentUser.id);
    expect(result).toEqual({ id: 'dsr-1', ...input });
  });

  it('correct delegates to DsrService.correct with the id, the body minus reason, and reason separately', async () => {
    const input: CreateDsrInput = {
      siteId: 'site-1',
      reportDate: '2026-08-10',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    };
    service.correct.mockResolvedValue({
      id: 'dsr-2',
      correctsId: 'dsr-1',
      ...input,
    });

    const result = await controller.correct(currentUser, 'dsr-1', {
      ...input,
      reason: 'Ravi was actually present',
    });

    expect(service.correct).toHaveBeenCalledWith(
      'dsr-1',
      input,
      'Ravi was actually present',
      currentUser.id,
    );
    expect(result).toEqual({ id: 'dsr-2', correctsId: 'dsr-1', ...input });
  });

  it('getDefaults delegates to DsrService.getCrewDefaults with siteId and date query params', async () => {
    service.getCrewDefaults.mockResolvedValue([
      { teamMemberId: 'tm-1', name: 'Ramesh Yadav' },
    ]);

    const result = await controller.getDefaults('site-1', '2026-08-10');

    expect(service.getCrewDefaults).toHaveBeenCalledWith(
      'site-1',
      '2026-08-10',
    );
    expect(result).toEqual([{ teamMemberId: 'tm-1', name: 'Ramesh Yadav' }]);
  });

  it('list delegates to DsrService.listByDate with the date query param', async () => {
    service.listByDate.mockResolvedValue([{ id: 'dsr-1' }]);

    const result = await controller.list('2026-08-12');

    expect(service.listByDate).toHaveBeenCalledWith('2026-08-12');
    expect(result).toEqual([{ id: 'dsr-1' }]);
  });

  it('findOne delegates to DsrService.findOne with the id', async () => {
    service.findOne.mockResolvedValue({ id: 'dsr-1' });

    const result = await controller.findOne('dsr-1');

    expect(service.findOne).toHaveBeenCalledWith('dsr-1');
    expect(result).toEqual({ id: 'dsr-1' });
  });
});
