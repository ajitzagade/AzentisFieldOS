import { Controller, Get, Param, Query } from '@nestjs/common';
import { StockService, type InventoryQuery } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  // The Inventory / Available Stock screen's single unified list — a
  // superset of q/categoryId/siteId/locationType/stockLevel/sort/order/
  // page/pageSize filters, more of them than any other list endpoint in
  // this app, so (unlike SitesController.list's individually-named
  // @Query() params) they're forwarded as one plain object straight
  // through to the service. Still no Zod pipe — same convention as every
  // other GET-filter controller (AD-7's shared-validator treatment is for
  // write bodies), and an unrecognized value in any field is "no filter",
  // never a 400.
  @Get('inventory')
  listInventory(@Query() query: InventoryQuery) {
    return this.stockService.listInventory(query);
  }

  @Get('godown')
  getGodownStock() {
    return this.stockService.getGodownStock();
  }

  // All-Sites stock in one query — the Inventory page's batch replacement
  // for looping GET /stock/site/:siteId once per Site. A distinct route
  // (one fewer path segment) from the one below, not a collision.
  @Get('site')
  getAllSiteStock() {
    return this.stockService.getAllSiteStock();
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

  // Informational-only — see getOtherSiteStockForMaterialSize's own
  // comment. `excludeSiteId` is required, not optional: the whole point is
  // "somewhere other than the Site I'm already looking at".
  @Get('material-size/:materialSizeId/other-sites')
  getOtherSiteStockForMaterialSize(
    @Param('materialSizeId') materialSizeId: string,
    @Query('excludeSiteId') excludeSiteId: string,
  ) {
    return this.stockService.getOtherSiteStockForMaterialSize(
      materialSizeId,
      excludeSiteId,
    );
  }
}
