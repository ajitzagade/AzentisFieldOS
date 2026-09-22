import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createDailyLabourWeeklyPaymentSchema,
  type CreateDailyLabourWeeklyPaymentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

@Controller('daily-labour-weekly-payments')
export class DailyLabourWeeklyPaymentsController {
  constructor(
    private readonly weeklyPaymentsService: DailyLabourWeeklyPaymentsService,
  ) {}

  // Labour Payment is a Site Engineer's own module, end to end — unlike
  // Team Payment/Purchase pricing (an Owner-only settlement step), both
  // roles record attendance/advances AND settle the weekly payment here,
  // matching how the rest of this module already has no role split.
  @Post()
  @UsePipes(new ZodValidationPipe(createDailyLabourWeeklyPaymentSchema))
  create(@Body() body: CreateDailyLabourWeeklyPaymentInput) {
    return this.weeklyPaymentsService.create(body);
  }

  @Get()
  list(@Query('labourerId') labourerId: string) {
    return this.weeklyPaymentsService.listForLabourer(labourerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyPaymentsService.findOne(id);
  }
}
