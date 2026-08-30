import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createVendorSchema,
  updateVendorSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VendorsService } from './vendors.service';

// RolesGuard is a no-op on handlers without @Roles() metadata, so adding it
// at controller level restricts ONLY the delete below.
@UseGuards(RolesGuard)
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

  // Soft delete (Owner/Admin only) — hides the Vendor everywhere; the row
  // and its purchase/RMC/disposal history remain in the database untouched.
  @Delete(':id')
  @Roles('OWNER_ADMIN')
  remove(@Param('id') id: string) {
    return this.vendorsService.softDelete(id);
  }
}
