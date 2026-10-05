import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  correctVendorAdvanceSchema,
  type CorrectVendorAdvanceInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VendorAdvancesService } from './vendor-advances.service';

@Controller('vendor-advances')
export class VendorAdvancesController {
  constructor(private readonly vendorAdvancesService: VendorAdvancesService) {}

  // A fresh Advance only ever comes from POST /waste-disposals — this is
  // the correction-only write path (AD-9). Open to both roles, same as the
  // Waste Disposal entry that originates every Vendor Advance.
  @Post()
  @UsePipes(new ZodValidationPipe(correctVendorAdvanceSchema))
  correct(@Body() body: CorrectVendorAdvanceInput) {
    return this.vendorAdvancesService.correct(body);
  }

  // Review finding (2026-09-06): Prisma treats an undefined `where.vendorId`
  // as "no filter", so an omitted query param would otherwise silently
  // return every Vendor's advances — require it explicitly.
  @Get()
  list(@Query('vendorId') vendorId?: string) {
    if (!vendorId) {
      throw new BadRequestException('vendorId is required');
    }
    return this.vendorAdvancesService.list(vendorId);
  }

  // The correction form's pre-fill fetch.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorAdvancesService.findOne(id);
  }
}
