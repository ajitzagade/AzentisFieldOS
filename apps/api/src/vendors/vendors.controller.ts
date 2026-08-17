import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  createVendorSchema,
  updateVendorSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VendorsService } from './vendors.service';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createVendorSchema))
  create(@Body() body: CreateVendorInput) {
    return this.vendorsService.create(body);
  }

  @Get()
  list() {
    return this.vendorsService.list();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVendorSchema)) body: UpdateVendorInput,
  ) {
    return this.vendorsService.update(id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Get(':id/purchases')
  purchases(@Param('id') id: string) {
    return this.vendorsService.purchases(id);
  }

  @Get(':id/purchase-summary')
  purchaseSummary(@Param('id') id: string) {
    return this.vendorsService.purchaseSummary(id);
  }
}
