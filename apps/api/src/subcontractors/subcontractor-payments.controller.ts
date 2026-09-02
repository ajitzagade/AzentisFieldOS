import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createSubcontractorPaymentSchema,
  type CreateSubcontractorPaymentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { SubcontractorPaymentsService } from './subcontractor-payments.service';

// Owner/Admin only, the whole controller — money movement against a
// Subcontractor is an Owner decision (mirrors SiteContractsController's
// gating rule), unlike Story 18.3's Work Entries.
@UseGuards(RolesGuard)
@Roles('OWNER_ADMIN')
@Controller('subcontractor-payments')
export class SubcontractorPaymentsController {
  constructor(private readonly paymentsService: SubcontractorPaymentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createSubcontractorPaymentSchema))
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateSubcontractorPaymentInput,
  ) {
    return this.paymentsService.create(body, user.id);
  }

  @Get()
  list(@Query('siteContractId') siteContractId?: string) {
    return this.paymentsService.list({ siteContractId });
  }
}
