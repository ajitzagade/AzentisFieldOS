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
  createDailyLabourAdvanceSchema,
  type CreateDailyLabourAdvanceInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DailyLabourAdvancesService } from './daily-labour-advances.service';

@Controller('daily-labour-advances')
export class DailyLabourAdvancesController {
  constructor(private readonly advancesService: DailyLabourAdvancesService) {}

  // Both roles — same reasoning as DailyLabourAttendanceController.
  @Post()
  @UsePipes(new ZodValidationPipe(createDailyLabourAdvanceSchema))
  create(@Body() body: CreateDailyLabourAdvanceInput) {
    return this.advancesService.create(body);
  }

  @Get()
  list(
    @Query('labourerId') labourerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.advancesService.list(labourerId, from, to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advancesService.findOne(id);
  }
}
