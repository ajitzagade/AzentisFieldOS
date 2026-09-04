import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.vendorsService.list({ q, page, pageSize, sort, order });
  }

  // Registered before @Get(':id') — a literal path segment must be matched
  // ahead of the dynamic :id route, or Nest/Express would treat
  // "purchase-summary" as an :id value here (same reasoning as @Get()
  // above being registered ahead of @Get(':id')).
  @Get('purchase-summary')
  purchaseSummaries(@Query('ids') ids?: string | string[]) {
    // A duplicate `?ids=a&ids=b` query string is parsed into an array by
    // Nest's underlying query parser (same hazard SearchController's own
    // `q` param handles) — join it back into the one comma-delimited
    // shape the single-value case already expects, rather than crashing
    // on `.split` not being a function. Trimmed so `ids=v1, v2` (a space
    // after the comma) doesn't silently produce a `' v2'` that matches
    // nothing.
    const raw = Array.isArray(ids) ? ids.join(',') : ids;
    const idList = raw
      ? raw
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
          // Same safety-valve reasoning as VendorsService.searchCandidates'
          // 200 cap — today's only caller (the Vendors list page) is
          // already bounded to 100 by paginationParams' MAX_PAGE_SIZE, so
          // this is defense-in-depth, not a limit anyone should ever hit.
          .slice(0, 200)
      : [];
    return this.vendorsService.purchaseSummaries(idList);
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
