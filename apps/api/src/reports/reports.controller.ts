import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { assetTypeSchema } from '@azentisfieldos/shared';
import { Public } from '../auth/public.decorator';
import { ReportCompilerService } from './report-compiler.service';
import { ReportDeliveryService } from './report-delivery.service';
import { ReportsService } from './reports.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { LabourReportsService } from './labour-reports.service';
import { MachineryVehicleReportsService } from './machinery-reports.service';
import { FinancialReportsService } from './financial-reports.service';

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
    private readonly labourReports: LabourReportsService,
    private readonly machineryReports: MachineryVehicleReportsService,
    private readonly financialReports: FinancialReportsService,
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
  // @Public(): Vercel Cron calls this with the CRON_SECRET bearer, not a user
  // session token — so it is exempt from the global auth guard and
  // continues to authenticate via assertCron() below. The two mechanisms
  // coexist; the global guard must never break the cron path.
  @Public()
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
  // @Public(): same CRON_SECRET-gated path as the compile cron above —
  // exempt from the global auth guard, authenticated by assertCron().
  @Public()
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

  // Story 13.3 (FR-44): the Labour Reports view — attendance/work history,
  // payment totals + history, and the Advance/Adjustment ledger within a date
  // window, optionally narrowed to one Team Member. A distinct sibling of
  // `/reports/daily/:id` (that wildcard requires the literal `daily`
  // segment), so it is not shadowed by it; the integration spec asserts this.
  @Get('reports/labour')
  labourReport(
    @Query('teamMemberId') teamMemberId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.labourReports.getLabourReport({ teamMemberId, from, to });
  }

  // Story 13.3 (FR-45): the Machinery/Vehicle Reports view — the asset
  // register (current status) always, plus one asset's movement and service
  // history within a date window when assetType+assetId pick one. assetType
  // is validated to MACHINERY|VEHICLE here (a malformed value is treated as
  // "no asset selected" — the register-only view — rather than a 400, since
  // it is an optional filter, not a required path segment).
  @Get('reports/machinery-vehicles')
  machineryReport(
    @Query('assetType') assetType?: string,
    @Query('assetId') assetId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const parsed = assetType ? assetTypeSchema.safeParse(assetType) : undefined;
    return this.machineryReports.getMachineryReport({
      assetType: parsed?.success ? parsed.data : undefined,
      assetId,
      from,
      to,
    });
  }

  // Story 13.4 (FR-46): the Financial Reports view — the five-category cost
  // breakdown, per-Site (`bySite`) and Contractor-wide (`contractorTotal`),
  // within a date window, optionally narrowed to one Site. A distinct sibling
  // of `/reports/daily/:id` (that wildcard requires the literal `daily`
  // segment), so it is not shadowed by it; the integration spec asserts this.
  @Get('reports/financial')
  financialReport(
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financialReports.getFinancialReport({ siteId, from, to });
  }
}
