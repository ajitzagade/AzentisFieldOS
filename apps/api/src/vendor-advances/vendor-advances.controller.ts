import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { VendorAdvancesService } from './vendor-advances.service';

@Controller('vendor-advances')
export class VendorAdvancesController {
  constructor(private readonly vendorAdvancesService: VendorAdvancesService) {}

  // Read-only — writes only ever happen inline from
  // POST /waste-disposals (see WasteDisposalService.create). Review
  // finding (2026-09-06): Prisma treats an undefined `where.vendorId` as
  // "no filter", so an omitted query param would otherwise silently
  // return every Vendor's advances — require it explicitly.
  @Get()
  list(@Query('vendorId') vendorId?: string) {
    if (!vendorId) {
      throw new BadRequestException('vendorId is required');
    }
    return this.vendorAdvancesService.list(vendorId);
  }
}
