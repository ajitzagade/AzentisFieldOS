import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';
import { SitesService } from '../sites/sites.service';
import type { Site } from '../generated/prisma/client';
import { StockService } from '../inventory/stock.service';
import { PaymentsService } from '../team/payments.service';
import { TeamMembersService } from '../team/team-members.service';
import {
  localDayRange,
  resolveAppTimeZone,
  type LocalDayRange,
} from './local-day';

export interface TodayActivity {
  sitesReportingToday: number;
  labourWorkingToday: number;
  materialsReceivedToday: number;
  materialsConsumedToday: number;
  rmcUsedTodayM3: number;
  machineryInUse: number;
  expensesToday: number;
  sitesMissingDsrToday: { siteId: string; name: string }[];
}

// Story 12.2 (FR-34): the cross-Site "Overall" rollup — every figure a direct
// call into its owning epic's existing service, never a re-derivation here.
export interface OverallRollup {
  activeSites: { count: number; names: string[] };
  inventory: { lowStockCount: number };
  outstandingAdvances: { total: number; teamMemberCount: number };
  pendingPayments: { count: number };
}

// The small Site-card grid below the Overall section — the same summary shape
// SitesService already returns, so each card can drill into /sites/[id].
export interface SitePreview {
  id: string;
  name: string;
  location: string;
  status: string;
}

// Command Center redesign (2026-09-08): the per-Site "Site operations —
// today" table. Every metric is a genuine same-day aggregate bucketed by
// Site; the Godown gets its own received-only bucket because a Purchase's
// destination can be the Godown (`siteId` null) while Consumption, Expense,
// and WorkRecord all require a `siteId` — the schema has no Godown-side
// data for those, so the API doesn't invent any.
export interface SiteBreakdownRow {
  id: string;
  name: string;
  location: string;
  status: string;
  report: { submitted: boolean; submittedAt: string | null };
  // null = no attended Work Record for this Site today — the frontend
  // renders "—", never a fabricated 0-headcount claim.
  labour: number | null;
  received: number;
  consumed: number;
  expenses: number;
}

export interface SiteBreakdown {
  sites: SiteBreakdownRow[];
  godown: { received: number };
}

// The band's 7-day sparklines: one entry per local calendar day, oldest
// first, today last.
export interface TrendDay {
  date: string;
  sitesReporting: number;
  labourWorking: number;
  expensesTotal: number;
}

export interface Trends {
  days: TrendDay[];
}

const TREND_DAYS = 7;

// A handful of the most-recently-created Sites for the Dashboard card grid;
// the full list lives at /sites (Epic 2).
const SITES_PREVIEW_LIMIT = 6;

// Story 12.1 (FR-35, SM-3): a pure read-aggregation layer over seven other
// epics' already-existing tables. This module owns no Prisma models of its own
// and never writes — every figure below is a genuine same-day aggregate, and a
// zero-activity day is a real, valid state (every figure legitimately 0), not
// an error (AD-6).
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamMembersService: TeamMembersService,
    private readonly sitesService: SitesService,
    private readonly stockService: StockService,
    private readonly paymentsService: PaymentsService,
  ) {}

  // `now`/`timeZone` are injectable so the local-day boundary can be tested
  // deterministically; production callers pass neither.
  async getToday(
    now: Date = new Date(),
    timeZone: string = resolveAppTimeZone(),
  ): Promise<TodayActivity> {
    const { dateOnly, startUtc, endUtc } = localDayRange(now, timeZone);
    const dayRange = { gte: startUtc, lt: endUtc };
    // A corrected DSR's original sub-rows stay in the ledger (AD-9) —
    // count only the current version's rows, or every corrected report
    // inflates today's tiles (same rule as ConsumptionService.list).
    const currentRows = currentDsrRowsWhere(
      await supersededDsrIds(this.prisma),
    );

    const [
      reportingSites,
      teamSummary,
      materialsReceivedToday,
      materialsConsumedToday,
      rmcAggregate,
      machineryInUse,
      expensesAggregate,
      activeSites,
    ] = await Promise.all([
      // COUNT(DISTINCT siteId) on DailySiteReport where reportDate = today.
      this.prisma.dailySiteReport.findMany({
        where: { reportDate: dateOnly },
        distinct: ['siteId'],
        select: { siteId: true },
      }),
      // Reuse Epic 6 Story 6.3's todaysWorkingHeadcount — never recompute the
      // distinct-Team-Member-with-a-Work-Record-today query here. Pin it to the
      // same local-timezone day (`dateOnly`) the other six tiles use, so the
      // Labour figure never lags them by a calendar day near UTC midnight.
      this.teamMembersService.getTeamSummary({ today: dateOnly }),
      this.prisma.purchase.count({ where: { purchasedAt: dayRange } }),
      this.prisma.consumption.count({
        where: { consumedAt: dayRange, ...currentRows },
      }),
      this.prisma.rmcEntry.aggregate({
        where: { deliveredAt: dayRange, ...currentRows },
        _sum: { quantityM3: true },
      }),
      // Live materialized current state (Epic 8 Story 8.2), not a "today"
      // delta — consistent with the mockup showing it as a snapshot.
      this.prisma.machinery.count({ where: { currentStatus: 'AT_SITE' } }),
      this.prisma.expense.aggregate({
        where: { incurredAt: dayRange, ...currentRows },
        _sum: { amount: true },
      }),
      // Every active (non-soft-deleted) Site, for the set-difference that
      // produces the gap flags.
      this.prisma.site.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const reportingSiteIds = new Set(reportingSites.map((r) => r.siteId));

    return {
      sitesReportingToday: reportingSiteIds.size,
      labourWorkingToday: teamSummary.todaysWorkingHeadcount,
      materialsReceivedToday,
      materialsConsumedToday,
      // Prisma's `_sum` is null against an empty match — coerce to 0 so the
      // frontend never distinguishes "no rows" from "zero total".
      rmcUsedTodayM3: rmcAggregate._sum.quantityM3?.toNumber() ?? 0,
      machineryInUse,
      expensesToday: expensesAggregate._sum.amount?.toNumber() ?? 0,
      // Set-difference, never a per-Site loop: every active Site not in the
      // reporting set is named explicitly (FR-35 — never a silent absence).
      sitesMissingDsrToday: activeSites
        .filter((site) => !reportingSiteIds.has(site.id))
        .map((site) => ({ siteId: site.id, name: site.name })),
    };
  }

  // Story 12.2 (FR-34, AC #2): a pure composition layer. Every figure is a
  // direct call into the epic that owns it — SitesService (Epic 2),
  // StockService.getLowStockMaterials (Epic 5 Story 5.7),
  // TeamMembersService.getOutstandingAdvances (Epic 7 Story 7.4),
  // PaymentsService.countPending (Epic 7 Story 7.3) — so each figure
  // reconciles with its source screen by construction, never re-derived here.
  async getOverall(): Promise<OverallRollup> {
    const [activeSites, lowStockMaterials, outstanding, pendingCount] =
      await Promise.all([
        // Never paginated (no page/pageSize passed) — always the Site[]
        // branch of SitesService.list's return type.
        this.sitesService.list({ status: 'ACTIVE' }) as Promise<Site[]>,
        this.stockService.getLowStockMaterials(),
        this.teamMembersService.getOutstandingAdvances(),
        this.paymentsService.countPending(),
      ]);

    return {
      activeSites: {
        count: activeSites.length,
        names: activeSites.map((site) => site.name),
      },
      inventory: { lowStockCount: lowStockMaterials.length },
      outstandingAdvances: {
        total: outstanding.total,
        teamMemberCount: outstanding.byTeamMember.length,
      },
      pendingPayments: { count: pendingCount },
    };
  }

  // The Dashboard's Site-card grid: the most-recently-created Sites, reusing
  // SitesService.list() (newest-first) and taking the first few — not a new
  // query shape. Returned unfiltered by status so the grid mirrors the full
  // Site roster (Active/On Hold/Completed) and its emptiness is a faithful
  // "this Tenant has no Sites at all" signal for the page-level zero-Sites
  // empty state (AC #1).
  async getSitesPreview(): Promise<SitePreview[]> {
    // Never paginated — always the Site[] branch of the return type.
    const sites = (await this.sitesService.list()) as Site[];
    return sites.slice(0, SITES_PREVIEW_LIMIT).map((site) => ({
      id: site.id,
      name: site.name,
      location: site.location,
      status: site.status,
    }));
  }

  // Command Center (2026-09-08): today's activity bucketed per Site, plus
  // the Godown's received-only bucket. Same read-aggregation posture as
  // getToday — same local-day window, same superseded-DSR exclusion on the
  // DSR-nested tables (Consumption, Expense), so the per-Site
  // received/consumed/expenses rows sum to the band's cross-Site figures by
  // construction. Labour is the one exception: each row is a per-Site
  // distinct-member count, so a member who attended two Sites appears in
  // both rows while the band's Labour Working KPI counts them once — the
  // frontend's totals row therefore takes the band's global figure, never a
  // sum of these rows.
  async getSiteBreakdown(
    now: Date = new Date(),
    timeZone: string = resolveAppTimeZone(),
  ): Promise<SiteBreakdown> {
    const { dateOnly, startUtc, endUtc } = localDayRange(now, timeZone);
    const dayRange = { gte: startUtc, lt: endUtc };
    const currentRows = currentDsrRowsWhere(
      await supersededDsrIds(this.prisma),
    );

    const [
      sites,
      dsrRows,
      workRows,
      purchaseGroups,
      consumptionGroups,
      expenseGroups,
    ] = await Promise.all([
      // The Site roster via SitesService.list(), minus COMPLETED Sites
      // (spec amendment, review 2026-09-08): this is a "today's operations"
      // view, and a tenant accumulates completed Sites forever — an
      // ever-growing wall of dash-filled rows would bury the live ones. An
      // On Hold Site still gets a row (with its honest "no report expected"
      // state), never a silent absence.
      (this.sitesService.list() as Promise<Site[]>).then((allSites) =>
        allSites.filter((site) => site.status !== 'COMPLETED'),
      ),
      // Ascending so the first row per Site is the original submission
      // time — a later correction row must not restate when the Site
      // actually reported.
      this.prisma.dailySiteReport.findMany({
        where: { reportDate: dateOnly },
        select: { siteId: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Distinct Team Members per Site — a member with two Work Records at
      // one Site today still counts once (same rule as the Labour tile).
      this.prisma.workRecord.findMany({
        where: { workDate: dateOnly, attended: true },
        select: { siteId: true, teamMemberId: true },
        distinct: ['siteId', 'teamMemberId'],
      }),
      // Purchases bucket by destination; `siteId` null ⇔ Godown. Unpriced
      // (D7) rows are deliberately included — this is a count of physical
      // inward entries, never a money figure.
      this.prisma.purchase.groupBy({
        by: ['siteId'],
        where: { purchasedAt: dayRange },
        _count: { _all: true },
      }),
      this.prisma.consumption.groupBy({
        by: ['siteId'],
        where: { consumedAt: dayRange, ...currentRows },
        _count: { _all: true },
      }),
      this.prisma.expense.groupBy({
        by: ['siteId'],
        where: { incurredAt: dayRange, ...currentRows },
        _sum: { amount: true },
      }),
    ]);

    const firstDsrBySite = new Map<string, Date>();
    for (const row of dsrRows) {
      if (!firstDsrBySite.has(row.siteId)) {
        firstDsrBySite.set(row.siteId, row.createdAt);
      }
    }

    const labourBySite = new Map<string, number>();
    for (const row of workRows) {
      labourBySite.set(row.siteId, (labourBySite.get(row.siteId) ?? 0) + 1);
    }

    const receivedBySite = new Map<string | null, number>();
    for (const group of purchaseGroups) {
      receivedBySite.set(group.siteId, group._count._all);
    }

    const consumedBySite = new Map<string, number>();
    for (const group of consumptionGroups) {
      consumedBySite.set(group.siteId, group._count._all);
    }

    const expensesBySite = new Map<string, number>();
    for (const group of expenseGroups) {
      expensesBySite.set(group.siteId, group._sum.amount?.toNumber() ?? 0);
    }

    return {
      sites: sites.map((site) => {
        const submittedAt = firstDsrBySite.get(site.id) ?? null;
        return {
          id: site.id,
          name: site.name,
          location: site.location,
          status: site.status,
          report: {
            submitted: submittedAt !== null,
            submittedAt: submittedAt?.toISOString() ?? null,
          },
          labour: labourBySite.get(site.id) ?? null,
          received: receivedBySite.get(site.id) ?? 0,
          consumed: consumedBySite.get(site.id) ?? 0,
          expenses: expensesBySite.get(site.id) ?? 0,
        };
      }),
      godown: { received: receivedBySite.get(null) ?? 0 },
    };
  }

  // Command Center (2026-09-08): the band's 7-day trend series. Three
  // full-window queries bucketed in JS — never one query per day — with
  // each bucket a real localDayRange window (so the series is correct
  // across any UTC-offset boundary, same rule as getToday).
  async getTrends(
    now: Date = new Date(),
    timeZone: string = resolveAppTimeZone(),
  ): Promise<Trends> {
    // Walk back day by day from today's window: the instant just before a
    // day's startUtc always belongs to the previous local day, whatever the
    // zone's offset does.
    const ranges: LocalDayRange[] = [localDayRange(now, timeZone)];
    while (ranges.length < TREND_DAYS) {
      const earliest = ranges[0]!;
      ranges.unshift(
        localDayRange(new Date(earliest.startUtc.getTime() - 1), timeZone),
      );
    }
    const first = ranges[0]!;
    const last = ranges[ranges.length - 1]!;

    const currentRows = currentDsrRowsWhere(
      await supersededDsrIds(this.prisma),
    );

    const [dsrRows, workRows, expenseRows] = await Promise.all([
      // One row per (Site, day) that reported — corrections collapse via
      // the same distinct the Sites Reporting tile uses.
      this.prisma.dailySiteReport.findMany({
        where: { reportDate: { gte: first.dateOnly, lte: last.dateOnly } },
        select: { siteId: true, reportDate: true },
        distinct: ['siteId', 'reportDate'],
      }),
      this.prisma.workRecord.findMany({
        where: {
          workDate: { gte: first.dateOnly, lte: last.dateOnly },
          attended: true,
        },
        select: { teamMemberId: true, workDate: true },
        distinct: ['teamMemberId', 'workDate'],
      }),
      this.prisma.expense.findMany({
        where: {
          incurredAt: { gte: first.startUtc, lt: last.endUtc },
          ...currentRows,
        },
        select: { amount: true, incurredAt: true },
      }),
    ]);

    // @db.Date columns come back as UTC-midnight-of-the-date — key them by
    // their ISO date, which is exactly LocalDayRange.dateStr.
    const dateKey = (value: Date) => value.toISOString().slice(0, 10);

    const sitesReportingByDay = new Map<string, number>();
    for (const row of dsrRows) {
      const key = dateKey(row.reportDate);
      sitesReportingByDay.set(key, (sitesReportingByDay.get(key) ?? 0) + 1);
    }

    const labourByDay = new Map<string, number>();
    for (const row of workRows) {
      const key = dateKey(row.workDate);
      labourByDay.set(key, (labourByDay.get(key) ?? 0) + 1);
    }

    const expensesByDay = new Map<string, number>();
    for (const row of expenseRows) {
      const day = ranges.find(
        (range) =>
          row.incurredAt >= range.startUtc && row.incurredAt < range.endUtc,
      );
      if (!day) continue;
      expensesByDay.set(
        day.dateStr,
        (expensesByDay.get(day.dateStr) ?? 0) + row.amount.toNumber(),
      );
    }

    return {
      days: ranges.map((range) => ({
        date: range.dateStr,
        sitesReporting: sitesReportingByDay.get(range.dateStr) ?? 0,
        labourWorking: labourByDay.get(range.dateStr) ?? 0,
        expensesTotal: expensesByDay.get(range.dateStr) ?? 0,
      })),
    };
  }
}
