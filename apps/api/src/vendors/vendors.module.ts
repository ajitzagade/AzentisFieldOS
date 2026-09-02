import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [InventoryModule],
  controllers: [VendorsController],
  providers: [VendorsService],
  // Story 19.2: SearchModule fans out to VendorsService.searchCandidates.
  exports: [VendorsService],
})
export class VendorsModule {}
