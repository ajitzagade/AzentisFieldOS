import {
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { MissingReportRemindersService } from './missing-report-reminders.service';

// A fourth cron candidate alongside compile-daily-reports,
// retry-report-deliveries, and run-report-schedules — NOT added to
// apps/api/vercel.json's `crons` array yet. Vercel Hobby caps at 2 daily-only
// cron jobs and the other three already don't fit that limit (AGENTS.md TODO
// — the crons array was pulled pending a redesign or a Pro upgrade). This
// endpoint is real and safe to call any number of times a day (idempotent —
// it reflects "as of right now", see the service), but nothing invokes it in
// production until that plan/redesign decision is made.
@Controller()
export class MissingReportRemindersController {
  constructor(private readonly service: MissingReportRemindersService) {}

  private assertCron(authorization?: string) {
    const secret = process.env.CRON_SECRET;
    if (!secret || authorization !== `Bearer ${secret}`) {
      throw new UnauthorizedException();
    }
  }

  @Public()
  @Post('cron/send-missing-report-reminders')
  async sendMissingReportReminders(
    @Headers('authorization') authorization?: string,
  ) {
    this.assertCron(authorization);
    return this.service.send();
  }
}
