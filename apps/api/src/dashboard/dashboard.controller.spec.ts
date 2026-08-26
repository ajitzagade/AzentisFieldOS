import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: { getToday: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    service = { getToday: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('GET /dashboard/today delegates to DashboardService.getToday', async () => {
    const payload = {
      sitesReportingToday: 2,
      labourWorkingToday: 42,
      materialsReceivedToday: 6,
      materialsConsumedToday: 18,
      rmcUsedTodayM3: 42,
      machineryInUse: 8,
      expensesToday: 86400,
      sitesMissingDsrToday: [{ siteId: 's3', name: 'Riverside Bridge' }],
    };
    service.getToday.mockResolvedValue(payload);

    await expect(controller.getToday()).resolves.toBe(payload);
    expect(service.getToday).toHaveBeenCalledTimes(1);
  });
});
