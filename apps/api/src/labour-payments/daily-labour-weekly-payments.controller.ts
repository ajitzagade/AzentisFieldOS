import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createDailyLabourWeeklyPaymentSchema,
  type CreateDailyLabourWeeklyPaymentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

@Controller('daily-labour-weekly-payments')
export class DailyLabourWeeklyPaymentsController {
  constructor(
    private readonly weeklyPaymentsService: DailyLabourWeeklyPaymentsService,
  ) {}

  // Money-movement settlement — Owner/Admin only, same reasoning as
  // Purchase pricing-completion and Team Payment creation: the Owner
  // decides how much advance to adjust and how much cash was actually paid.
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
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
