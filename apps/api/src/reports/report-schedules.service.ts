import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateReportScheduleInput,
  UpdateReportScheduleInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { LabourReportsService } from './labour-reports.service';
import { MachineryVehicleReportsService } from './machinery-reports.service';
import { FinancialReportsService } from './financial-reports.service';
import { ReportDeliveryService } from './report-delivery.service';
import {
  DEFAULT_BRANDING,
  type ReportContent,
} from './report-compiler.service';

const DAY_MS = 24 * 60 * 60 * 1000;

// Story 14.5 (FR-51): the minimum time that must elapse since lastRunAt before a
// schedule is due again. MONTHLY uses a 30-day approximation — good enough for a
// cadence gate that also re-checks hourly; the exact "last calendar month" is
// applied to the report's DATA WINDOW (dateRange), not to this due threshold.
const FREQUENCY_INTERVAL_MS: Record<string, number> = {
  DAILY: DAY_MS,
  WEEKLY: 7 * DAY_MS,
  MONTHLY: 30 * DAY_MS,
};

type ScheduleRow = {
  id: string;
  reportType: string;
  frequency: string;
  recipientUserIds: string[];
  enabled: boolean;
  siteId: string | null;
  lastRunAt: Date | null;
};

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Story 14.5 (FR-51): the scheduled-report configuration + the Cron runner. The
// runner reuses Epic 13's report-query services and Story 13.1's
// ReportDeliveryService completely — the only new logic is "is this schedule
// due, and if so, fetch + deliver." It governs ReportSchedule rows ONLY: it
// never touches NotificationChannelSetting (Story 14.4) or the daily-DSR
// DailyReport/compile path (Story 13.1), so FR-51's independence from FR-50 is
// structural, not conventional.
@Injectable()
export class ReportSchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly siteInventoryReports: SiteInventoryReportsService,
    private readonly labourReports: LabourReportsService,
    private readonly machineryReports: MachineryVehicleReportsService,
    private readonly financialReports: FinancialReportsService,
    private readonly delivery: ReportDeliveryService,
  ) {}

  create(input: CreateReportScheduleInput) {
    return this.prisma.reportSchedule.create({ data: input });
  }

  list() {
    return this.prisma.reportSchedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, input: UpdateReportScheduleInput) {
    try {
      return await this.prisma.reportSchedule.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Report Schedule ${id} not found`);
      }
      throw error;
    }
  }

  // Due when frequency-worth of time has elapsed since lastRunAt — or
  // immediately if it has never run (lastRunAt null).
  isDue(
    schedule: Pick<ScheduleRow, 'frequency' | 'lastRunAt'>,
    now: Date,
  ): boolean {
    if (!schedule.lastRunAt) return true;
    const elapsed = now.getTime() - new Date(schedule.lastRunAt).getTime();
    const interval = FREQUENCY_INTERVAL_MS[schedule.frequency] ?? DAY_MS;
    return elapsed >= interval;
  }

  // The report's DATA WINDOW, derived from the cadence: daily → yesterday,
  // weekly → last 7 days, monthly → last calendar month.
  dateRange(frequency: string, now: Date): { from: string; to: string } {
    if (frequency === 'WEEKLY') {
      const to = new Date(now.getTime() - DAY_MS);
      const from = new Date(now.getTime() - 7 * DAY_MS);
      return { from: toDateString(from), to: toDateString(to) };
    }
    if (frequency === 'MONTHLY') {
      const firstOfThisMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
      );
      const lastMonthEnd = new Date(firstOfThisMonth.getTime() - DAY_MS);
      const lastMonthStart = new Date(
        Date.UTC(lastMonthEnd.getUTCFullYear(), lastMonthEnd.getUTCMonth(), 1),
      );
      return {
        from: toDateString(lastMonthStart),
        to: toDateString(lastMonthEnd),
      };
    }
    // DAILY (default): yesterday.
    const yesterday = new Date(now.getTime() - DAY_MS);
    return { from: toDateString(yesterday), to: toDateString(yesterday) };
  }

  // Calls the correct Epic 13 report-query service for the schedule's type.
  fetchReport(
    schedule: Pick<ScheduleRow, 'reportType' | 'siteId'>,
    range: { from: string; to: string },
  ): Promise<unknown> {
    const { from, to } = range;
    const siteId = schedule.siteId ?? undefined;
    switch (schedule.reportType) {
      case 'SITE':
        return this.siteInventoryReports.getSiteReport({ siteId, from, to });
      case 'INVENTORY':
        return this.siteInventoryReports.getInventoryReport({
          siteId,
          from,
          to,
        });
      case 'LABOUR':
        return this.labourReports.getLabourReport({ from, to });
      case 'MACHINERY_VEHICLE':
        return this.machineryReports.getMachineryReport({ from, to });
      case 'FINANCIAL':
        return this.financialReports.getFinancialReport({ siteId, from, to });
      default:
        throw new Error(`Unknown report type: ${schedule.reportType}`);
    }
  }

  // The delivery envelope. The scheduled report is delivered as a branded
  // notification whose header identifies the report type + window; the fetched
  // report is the data that WOULD be rendered — richer per-type email bodies are
  // follow-up work (the same "senders not yet exercised against a real provider"
  // posture as Story 13.1). Uses the neutral branding default; it never reads
  // BrandingConfig here, keeping the runner free of the daily compile path.
  private buildEnvelope(
    schedule: Pick<ScheduleRow, 'reportType'>,
    range: { from: string; to: string },
  ): ReportContent {
    const label = `${schedule.reportType.replace(/_/g, ' / ')} Report`;
    return {
      siteName: label,
      reportDate: `${range.from} → ${range.to}`,
      branding: DEFAULT_BRANDING,
      work: {
        completed: null,
        inProgress: null,
        planned: null,
        issuesBlockers: null,
        safetyObservations: null,
        notes: null,
      },
      labour: { present: 0, total: 0 },
      materials: [],
      rmc: { loads: 0, totalQuantityM3: 0, grades: [] },
      equipmentUsed: [],
      expenses: { total: 0 },
      photos: { count: 0 },
    };
  }

  // The Cron entry point. For each due, enabled ReportSchedule: fetch its report
  // (Epic 13) and deliver it to the schedule's own recipients via
  // ReportDeliveryService (Story 13.1). Updates lastRunAt on success. One
  // schedule's failure never aborts the run.
  async runDueSchedules(now: Date = new Date()) {
    const schedules = (await this.prisma.reportSchedule.findMany({
      where: { enabled: true },
    })) as ScheduleRow[];

    let delivered = 0;
    const failedScheduleIds: string[] = [];

    for (const schedule of schedules) {
      if (!this.isDue(schedule, now)) continue;
      try {
        const range = this.dateRange(schedule.frequency, now);
        await this.fetchReport(schedule, range);
        await this.delivery.deliverScheduledReport(
          schedule.recipientUserIds,
          this.buildEnvelope(schedule, range),
        );
        await this.prisma.reportSchedule.update({
          where: { id: schedule.id },
          data: { lastRunAt: now },
        });
        delivered += 1;
      } catch {
        failedScheduleIds.push(schedule.id);
      }
    }

    return {
      evaluated: schedules.length,
      delivered,
      failedScheduleIds,
    };
  }
}
