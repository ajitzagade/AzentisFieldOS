import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createPaymentSchema,
  type CreatePaymentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Money movement — Owner/Admin only (mirrors AdvancesController).
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  create(@Body() body: CreatePaymentInput) {
    return this.paymentsService.create(body);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.paymentsService.list({ q, page, pageSize, sort, order });
  }

  @Get('count/pending')
  countPending() {
    return this.paymentsService.countPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // Money movement — Owner/Admin only (mirrors create()).
  // No @UsePipes here — there is no body to validate (markPaymentPaidSchema
  // is an empty object solely for the web layer's typing), and a
  // method-scoped ZodValidationPipe runs against every argument-extracting
  // parameter of the handler, including @Param('id') — attaching one here
  // would validate the id string against the schema too.
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.paymentsService.markPaid(id);
  }
}
