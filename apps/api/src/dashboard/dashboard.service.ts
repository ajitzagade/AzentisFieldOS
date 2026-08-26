import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  ) {}

  // `now`/`timeZone` are injectable so the local-day boundary can be tested
  // deterministically; production callers pass neither.
  async getToday(
    now: Date = new Date(),
    timeZone: string = resolveAppTimeZone(),
  ): Promise<TodayActivity> {
    const { dateOnly, startUtc, endUtc } = localDayRange(now, timeZone);
    const dayRange = { gte: startUtc, lt: endUtc };

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
      this.prisma.consumption.count({ where: { consumedAt: dayRange } }),
      this.prisma.rmcEntry.aggregate({
        where: { deliveredAt: dayRange },
        _sum: { quantityM3: true },
      }),
      // Live materialized current state (Epic 8 Story 8.2), not a "today"
      // delta — consistent with the mockup showing it as a snapshot.
      this.prisma.machinery.count({ where: { currentStatus: 'AT_SITE' } }),
      this.prisma.expense.aggregate({
        where: { incurredAt: dayRange },
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
}
