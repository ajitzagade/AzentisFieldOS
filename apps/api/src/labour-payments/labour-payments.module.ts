import { Module } from '@nestjs/common';
import { DailyLabourersController } from './daily-labourers.controller';
import { DailyLabourersService } from './daily-labourers.service';
import { DailyLabourAttendanceController } from './daily-labour-attendance.controller';
import { DailyLabourAttendanceService } from './daily-labour-attendance.service';
import { DailyLabourAdvancesController } from './daily-labour-advances.controller';
import { DailyLabourAdvancesService } from './daily-labour-advances.service';
import { DailyLabourWeeklyPaymentsController } from './daily-labour-weekly-payments.controller';
import { DailyLabourWeeklyPaymentsService } from './daily-labour-weekly-payments.service';

@Module({
  controllers: [
    DailyLabourersController,
    DailyLabourAttendanceController,
    DailyLabourAdvancesController,
    DailyLabourWeeklyPaymentsController,
  ],
  providers: [
    DailyLabourersService,
    DailyLabourAttendanceService,
    DailyLabourAdvancesService,
    DailyLabourWeeklyPaymentsService,
  ],
})
export class LabourPaymentsModule {}
