import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyLabourersController } from './daily-labourers.controller';
import { DailyLabourersService } from './daily-labourers.service';

describe('DailyLabourersController', () => {
  let controller: DailyLabourersController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    list: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = { create: vi.fn(), list: vi.fn(), findOne: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLabourersController],
      providers: [{ provide: DailyLabourersService, useValue: service }],
    }).compile();
    controller = module.get<DailyLabourersController>(
      DailyLabourersController,
    );
  });

  it('create delegates to the service', async () => {
    const input = { name: 'Ramesh Kumar', category: 'Mistri' as const, isActive: true };
    service.create.mockResolvedValue({ id: 'l1' });

    const result = await controller.create(input);

    expect(service.create).toHaveBeenCalledWith(input);
    expect(result).toEqual({ id: 'l1' });
  });

  it('list forwards all five query params to the service as one object', async () => {
    service.list.mockResolvedValue([{ id: 'l1' }]);

    const result = await controller.list('mistri', '2', '10', 'category', 'desc');

    expect(service.list).toHaveBeenCalledWith({
      q: 'mistri',
      page: '2',
      pageSize: '10',
      sort: 'category',
      order: 'desc',
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
    });
  });
});
