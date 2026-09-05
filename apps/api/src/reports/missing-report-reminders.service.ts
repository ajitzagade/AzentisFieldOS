import { Injectable } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

// NOT wired to an actual schedule yet — see this method's own doc comment
// at the controller (AGENTS.md's existing TODO: Vercel Hobby's 2-cron-job
// cap already blocks the compile-daily-reports/report-schedules crons from
// being live; this would be a fourth candidate). Safe to call any number of
// times a day — it always reflects "as of right now," never accumulates
// duplicate state, so calling it more or less often only changes how
// promptly a Site's absence is noticed, never correctness.
// Owner/Admin push body caps the named Sites — a tenant with many Sites
// missing at once (e.g. early morning, before anyone has reported) could
// otherwise produce an unbounded comma-joined list, which is both unreadable
// (most platforms truncate a notification body well before this) and,
// unchecked, could approach the Web Push payload ceiling.
const MAX_NAMED_SITES = 8;

@Injectable()
export class MissingReportRemindersService {
  constructor(
    private readonly dashboard: DashboardService,
    private readonly pushNotifications: PushNotificationsService,
  ) {}

  async send(): Promise<{ missingCount: number }> {
    const { sitesMissingDsrToday } = await this.dashboard.getToday();

    if (sitesMissingDsrToday.length === 0) {
      return { missingCount: 0 };
    }

    const namedSites = sitesMissingDsrToday
      .slice(0, MAX_NAMED_SITES)
      .map((site) => site.name)
      .join(', ');
    const remainder = sitesMissingDsrToday.length - MAX_NAMED_SITES;
    const ownerBody =
      remainder > 0 ? `${namedSites}, and ${remainder} more` : namedSites;

    // No Site→Supervisor assignment exists in this product (any Supervisor
    // can submit for any Site via the remembered-Site picker) — so the
    // reminder goes to every Supervisor, not a per-Site owner. The Owner's
    // push instead names every Site still missing, mirroring the
    // Dashboard's own gap-flag list.
    await Promise.all([
      this.pushNotifications.sendToRole('SITE_SUPERVISOR', {
        title: "Don't forget today's Daily Report",
        body:
          sitesMissingDsrToday.length === 1
            ? `${sitesMissingDsrToday[0]!.name} hasn't submitted today's Daily Report yet.`
            : `${sitesMissingDsrToday.length} Sites haven't submitted today's Daily Report yet.`,
        url: '/dsr/new',
      }),
      this.pushNotifications.sendToRole('OWNER_ADMIN', {
        title: 'Sites missing today’s Daily Report',
        body: ownerBody,
        url: '/',
      }),
    ]);

    return { missingCount: sitesMissingDsrToday.length };
  }
}
