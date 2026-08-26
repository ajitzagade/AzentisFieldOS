import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { ConsumptionController } from './consumption.controller';
import { ConsumptionService } from './consumption.service';
import { ReturnWastageController } from './return-wastage.controller';
import { ReturnWastageService } from './return-wastage.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  controllers: [
    PurchasesController,
    MovementsController,
    ConsumptionController,
    ReturnWastageController,
    StockController,
  ],
  providers: [
    PurchasesService,
    MovementsService,
    ConsumptionService,
    ReturnWastageService,
    StockService,
  ],
  // VendorsModule (Story 9.2) reuses PurchasesService's Vendor-filtered
  // queries rather than duplicating them against Purchase directly.
  // StockService is exported so DashboardModule (Story 12.2) can reuse
  // getLowStockMaterials() rather than re-derive the low-stock set.
  // The remaining transaction services are exported so ReportsModule
  // (Story 13.2) can compose the Inventory Reports view from each epic's
  // existing list query rather than re-query these tables itself.
  exports: [
    PurchasesService,
    StockService,
    MovementsService,
    ConsumptionService,
    ReturnWastageService,
  ],
})
export class InventoryModule {}
