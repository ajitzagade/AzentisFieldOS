import { Module } from '@nestjs/common';
import { VendorAdvancesController } from './vendor-advances.controller';
import { VendorAdvancesService } from './vendor-advances.service';

@Module({
  controllers: [VendorAdvancesController],
  providers: [VendorAdvancesService],
})
export class VendorAdvancesModule {}
