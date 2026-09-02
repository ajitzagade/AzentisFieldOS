import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

describe('StockController', () => {
  let controller: StockController;
  let service: {
    getGodownStock: ReturnType<typeof vi.fn>;
    getAllSiteStock: ReturnType<typeof vi.fn>;
    getSiteStock: ReturnType<typeof vi.fn>;
    getLowStockMaterials: ReturnType<typeof vi.fn>;
    getStockByMaterial: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getGodownStock: vi.fn(),
      getAllSiteStock: vi.fn(),
      getSiteStock: vi.fn(),
      getLowStockMaterials: vi.fn(),
      getStockByMaterial: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: service }],
    }).compile();

    controller = module.get<StockController>(StockController);
  });

  it('getGodownStock delegates to StockService.getGodownStock', async () => {
    service.getGodownStock.mockResolvedValue([{ materialSizeId: 'ms1' }]);

    const result = await controller.getGodownStock();

    expect(service.getGodownStock).toHaveBeenCalled();
    expect(result).toEqual([{ materialSizeId: 'ms1' }]);
  });

  // The Inventory page's batch replacement for looping GET /stock/site/:id
  // once per Site.
  it('getAllSiteStock delegates to StockService.getAllSiteStock', async () => {
    service.getAllSiteStock.mockResolvedValue([{ materialSizeId: 'ms1' }]);

    const result = await controller.getAllSiteStock();

    expect(service.getAllSiteStock).toHaveBeenCalled();
    expect(result).toEqual([{ materialSizeId: 'ms1' }]);
  });

  it('getSiteStock delegates to StockService.getSiteStock with the siteId param', async () => {
    service.getSiteStock.mockResolvedValue([{ materialSizeId: 'ms1' }]);

    const result = await controller.getSiteStock('site1');

    expect(service.getSiteStock).toHaveBeenCalledWith('site1');
    expect(result).toEqual([{ materialSizeId: 'ms1' }]);
  });

  it('getLowStockMaterials delegates to StockService.getLowStockMaterials', async () => {
    service.getLowStockMaterials.mockResolvedValue([{ id: 'mat-1' }]);

    const result = await controller.getLowStockMaterials();

    expect(service.getLowStockMaterials).toHaveBeenCalled();
    expect(result).toEqual([{ id: 'mat-1' }]);
  });

  it('getStockByMaterial delegates to StockService.getStockByMaterial with the materialId param', async () => {
    service.getStockByMaterial.mockResolvedValue([{ materialSizeId: 'ms1' }]);

    const result = await controller.getStockByMaterial('mat-1');

    expect(service.getStockByMaterial).toHaveBeenCalledWith('mat-1');
    expect(result).toEqual([{ materialSizeId: 'ms1' }]);
  });
});
