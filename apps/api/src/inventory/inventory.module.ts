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
  exports: [PurchasesService],
})
export class InventoryModule {}
