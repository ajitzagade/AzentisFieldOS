import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  createReportScheduleSchema,
  updateReportScheduleSchema,
  type CreateReportScheduleInput,
  type UpdateReportScheduleInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReportSchedulesService } from './report-schedules.service';

// Story 14.5 (FR-51). The admin CRUD is an Owner/Admin-only surface
// (@Roles('OWNER_ADMIN'), mirrors UsersController). The Cron runner is @Public +
// CRON_SECRET-gated — the same pattern Story 13.1's cron routes use, exempt from
// the global CustomAuthGuard because Vercel Cron calls it with the secret
// bearer, not a user session token. RolesGuard is a no-op on the @Public
// route (it carries no @Roles metadata).
@Controller()
@UseGuards(RolesGuard)
export class ReportSchedulesController {
  constructor(private readonly service: ReportSchedulesService) {}

  private assertCron(authorization?: string) {
    const secret = process.env.CRON_SECRET;
    if (!secret || authorization !== `Bearer ${secret}`) {
      throw new UnauthorizedException();
    }
  }

  @Post('report-schedules')
  @Roles('OWNER_ADMIN')
  create(
    @Body(new ZodValidationPipe(createReportScheduleSchema))
    body: CreateReportScheduleInput,
  ) {
    return this.service.create(body);
  }

  @Get('report-schedules')
  @Roles('OWNER_ADMIN')
  list() {
    return this.service.list();
  }

  @Patch('report-schedules/:id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateReportScheduleSchema))
    body: UpdateReportScheduleInput,
  ) {
    return this.service.update(id, body);
  }

  // The second Cron target (AD-13), alongside Story 13.1's compile-daily-reports.
  // Governs ReportSchedule rows exclusively — its own schedule/model, never a
  // shared job with a mode flag, so FR-51's independence from FR-50 holds
  // structurally.
  @Public()
  @Post('cron/run-report-schedules')
  async runReportSchedules(@Headers('authorization') authorization?: string) {
    this.assertCron(authorization);
    return this.service.runDueSchedules();
  }
}
