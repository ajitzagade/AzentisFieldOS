import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  completePurchasePricingSchema,
  createPurchaseSchema,
  type CompletePurchasePricingInput,
  type CreatePurchaseInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PurchasesService } from './purchases.service';

// RolesGuard is a no-op on handlers without @Roles() metadata — only the
// pricing completion below is Owner/Admin-gated (D7); everything else keeps
// its both-roles behavior.
@UseGuards(RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPurchaseSchema))
  create(@Body() body: CreatePurchaseInput) {
    return this.purchasesService.create(body);
  }

  @Get()
  list() {
    return this.purchasesService.list();
  }

  @Get('count/this-month')
  countThisMonth() {
    return this.purchasesService.countThisMonth();
  }

  // D7: how many inward entries are still waiting for the Owner's pricing —
  // drives the Dashboard gap-flag and the Movements page banner.
  @Get('count/pending-pricing')
  countPendingPricing() {
    return this.purchasesService.countPendingPricing();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  // D7: one-time completion of a Supervisor's unpriced inward entry. Only
  // fills the to-be-priced group on a row where it is still NULL — an
  // already-priced Purchase is immutable here (AD-9; corrections go through
  // POST /purchases with correctsId). Owner/Admin only.
  @Patch(':id/pricing')
  @Roles('OWNER_ADMIN')
  completePricing(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(completePurchasePricingSchema))
    body: CompletePurchasePricingInput,
  ) {
    return this.purchasesService.completePricing(id, body);
  }
}
