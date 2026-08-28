import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';
import { SitesService } from '../sites/sites.service';
import { StockService } from '../inventory/stock.service';
import { PaymentsService } from '../team/payments.service';
import { TeamMembersService } from '../team/team-members.service';
import { localDayRange, resolveAppTimeZone } from './local-day';

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
      // Every active Site, for the set-difference that produces the gap flags.
      this.prisma.site.findMany({
        where: { status: 'ACTIVE' },
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
        this.sitesService.list('ACTIVE'),
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
    const sites = await this.sitesService.list();
    return sites.slice(0, SITES_PREVIEW_LIMIT).map((site) => ({
      id: site.id,
      name: site.name,
      location: site.location,
      status: site.status,
    }));
  }
}
