import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    getToday: ReturnType<typeof vi.fn>;
    getOverall: ReturnType<typeof vi.fn>;
    getSitesPreview: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getToday: vi.fn(),
      getOverall: vi.fn(),
      getSitesPreview: vi.fn(),
    };

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

  it('GET /dashboard/overall delegates to DashboardService.getOverall', async () => {
    const payload = {
      activeSites: { count: 2, names: ['NH-48 Widening', 'Metro Depot'] },
      inventory: { lowStockCount: 3 },
      outstandingAdvances: { total: 314200, teamMemberCount: 9 },
      pendingPayments: { count: 4 },
    };
    service.getOverall.mockResolvedValue(payload);

    await expect(controller.getOverall()).resolves.toBe(payload);
    expect(service.getOverall).toHaveBeenCalledTimes(1);
  });

  it('GET /dashboard/sites-preview delegates to DashboardService.getSitesPreview', async () => {
    const payload = [
      {
        id: 's1',
        name: 'NH-48 Widening',
        location: 'Nashik',
        status: 'ACTIVE',
      },
    ];
    service.getSitesPreview.mockResolvedValue(payload);

    await expect(controller.getSitesPreview()).resolves.toBe(payload);
    expect(service.getSitesPreview).toHaveBeenCalledTimes(1);
  });
});
