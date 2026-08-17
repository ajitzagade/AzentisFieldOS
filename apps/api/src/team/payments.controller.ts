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
  createPaymentSchema,
  type CreatePaymentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  create(@Body() body: CreatePaymentInput) {
    return this.paymentsService.create(body);
  }

  @Get()
  list() {
    return this.paymentsService.list();
  }

  @Get('count/pending')
  countPending() {
    return this.paymentsService.countPending();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // No @UsePipes here — there is no body to validate (markPaymentPaidSchema
  // is an empty object solely for the web layer's typing), and a
  // method-scoped ZodValidationPipe runs against every argument-extracting
  // parameter of the handler, including @Param('id') — attaching one here
  // would validate the id string against the schema too.
  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.paymentsService.markPaid(id);
  }
}
