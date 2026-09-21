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
  createDailyLabourAttendanceSchema,
  type CreateDailyLabourAttendanceInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DailyLabourAttendanceService } from './daily-labour-attendance.service';

@Controller('daily-labour-attendance')
export class DailyLabourAttendanceController {
  constructor(
    private readonly attendanceService: DailyLabourAttendanceService,
  ) {}

  // Both roles — a Supervisor is typically the one physically present when
  // daily-wage labour attendance (and any same-day advance) is recorded.
  @Post()
  @UsePipes(new ZodValidationPipe(createDailyLabourAttendanceSchema))
  create(@Body() body: CreateDailyLabourAttendanceInput) {
    return this.attendanceService.create(body);
  }

  @Get()
  list(
    @Query('labourerId') labourerId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.listForLabourer(labourerId, from, to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }
}
