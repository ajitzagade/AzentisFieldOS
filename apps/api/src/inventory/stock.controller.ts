import { Controller, Get, Param } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('godown')
  getGodownStock() {
    return this.stockService.getGodownStock();
  }

  @Get('site/:siteId')
  getSiteStock(@Param('siteId') siteId: string) {
    return this.stockService.getSiteStock(siteId);
  }

  @Get('low-stock')
  getLowStockMaterials() {
    return this.stockService.getLowStockMaterials();
  }

  @Get('material/:materialId')
  getStockByMaterial(@Param('materialId') materialId: string) {
    return this.stockService.getStockByMaterial(materialId);
  }
}
