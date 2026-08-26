import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';

// Normalizes an optional YYYY-MM-DD override (or "today") to a UTC-midnight
// Date matching DailySiteReport.reportDate (@db.Date). NOTE (open decision):
// "today" is computed in UTC; the Cron schedule hour and the report day's
// timezone both hinge on the same unconfirmed 6 PM-local question flagged in
// the story — revisit once the product owner confirms the delivery hour.
function toReportDate(input?: string): Date {
  const base = input ? new Date(input) : new Date();
  return new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()),
  );
}

@Controller()
export class ReportsController {
  constructor(
    private readonly compiler: ReportCompilerService,
    private readonly delivery: ReportDeliveryService,
    private readonly reports: ReportsService,
    private readonly siteInventoryReports: SiteInventoryReportsService,
  ) {}

  // Verifies the Vercel Cron request via the standard `Authorization: Bearer
  // $CRON_SECRET` header Vercel sends. Fail-closed: a missing CRON_SECRET env
  // var rejects everything, so this endpoint can never be publicly callable.
  private assertCron(authorization?: string) {
    const secret = process.env.CRON_SECRET;
    if (!secret || authorization !== `Bearer ${secret}`) {
      throw new UnauthorizedException();
    }
  }

  // AD-13: the Vercel Cron target (no separate worker service). For each Site
  // with a current DSR for the day, compile the branded report (idempotent)
  // and attempt delivery on every enabled channel. A Site with no DSR produces
  // no report (AC #4). The optional ?date= override backfills/re-runs a
  // specific day.
  @Post('cron/compile-daily-reports')
  async compileDailyReports(
    @Headers('authorization') authorization?: string,
    @Query('date') date?: string,
  ) {
    this.assertCron(authorization);
    const reportDate = toReportDate(date);
    const dsrs = await this.compiler.currentDsrsForDate(reportDate);

    let compiled = 0;
    const failedSiteIds: string[] = [];
    for (const dsr of dsrs) {
      // One Site's DB error (compile or delivery) must not abort the whole run
      // — record it and continue so every other Site still gets its report.
      // This is why `compiled` can be < `sitesWithDsr`.
      try {
        const report = await this.compiler.compile(dsr);
        await this.delivery.ensureDeliveries(report.id);
        compiled += 1;
      } catch {
        failedSiteIds.push(dsr.siteId);
      }
    }

    return {
      reportDate: reportDate.toISOString().slice(0, 10),
      sitesWithDsr: dsrs.length,
      compiled,
      failedSiteIds,
    };
  }

  // The retry-sweep Cron: re-attempts deliveries still PENDING and under the
  // attempt cap, reusing the same idempotent send().
  @Post('cron/retry-report-deliveries')
  async retryReportDeliveries(
    @Headers('authorization') authorization?: string,
  ) {
    this.assertCron(authorization);
    return this.delivery.retryPending();
  }

  // "Recent Reports" delivery log. Static path — declared before the `:id`
  // wildcard below so Nest (declaration-order matching) never resolves
  // `/reports/daily` to `findDaily('daily')`.
  @Get('reports/daily')
  listDaily(
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reports.listDaily({ siteId, from, to });
  }

  // The full compiled `content` payload for the branded report-preview card.
  @Get('reports/daily/:id')
  findDaily(@Param('id') id: string) {
    return this.reports.findDaily(id);
  }

  // Story 13.2 (FR-42): the Site Reports view — DSR history, activity/photo
  // history for one Site within a date window. A distinct sibling path from
  // `/reports/daily/:id` (the `daily` literal segment is required there), so
  // it is not shadowed by that wildcard; the integration spec asserts this.
  @Get('reports/sites')
  siteReport(
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.siteInventoryReports.getSiteReport({ siteId, from, to });
  }

  // Story 13.2 (FR-43): the Inventory Reports view — current stock, low-stock
  // flags, and the four transaction histories within a date window,
  // optionally narrowed by Site and Material.
  @Get('reports/inventory')
  inventoryReport(
    @Query('siteId') siteId?: string,
    @Query('materialId') materialId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.siteInventoryReports.getInventoryReport({
      siteId,
      materialId,
      from,
      to,
    });
  }
}
