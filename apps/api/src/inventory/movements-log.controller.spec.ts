import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MovementsLogController } from './movements-log.controller';
import { MovementsLogService } from './movements-log.service';

describe('MovementsLogController', () => {
  let controller: MovementsLogController;
  let service: { list: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = { list: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementsLogController],
      providers: [{ provide: MovementsLogService, useValue: service }],
    }).compile();
    controller = module.get(MovementsLogController);
  });

  it('forwards q/page/pageSize/type/siteId/from/to to MovementsLogService.list as one object', async () => {
    service.list.mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });

    await controller.list(
      'cement',
      '1',
      '25',
      'PURCHASE',
      's1',
      '2026-08-01',
      '2026-08-31',
    );

    expect(service.list).toHaveBeenCalledWith({
      q: 'cement',
      page: '1',
      pageSize: '25',
      type: 'PURCHASE',
      siteId: 's1',
      from: '2026-08-01',
      to: '2026-08-31',
    });
  });

  it('forwards sort/order query params to MovementsLogService.list', async () => {
    service.list.mockResolvedValue({
      rows: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });

    await controller.list(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'date',
      'asc',
    );

    expect(service.list).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'date', order: 'asc' }),
    );
  });
});
