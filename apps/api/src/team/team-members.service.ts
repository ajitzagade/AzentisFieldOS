import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-19: Owner/Admin creates and maintains Team Member records — one
// accurate roster, never bound to a single Site (AC #2). No siteId field
// or relation anywhere in this module.
@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateTeamMemberInput) {
    try {
      return await this.prisma.teamMember.create({ data: input });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 6.1's Dev Notes: "current/last Site" must always be *derived*
  // (the most recent WorkRecord.siteId), never stored on TeamMember
  // itself (AC #2) — this is that derivation, built here per Story 6.1's
  // own forward reference ("this module doesn't build that derivation,
  // Story 6.3 does").
  async list() {
    const teamMembers = await this.prisma.teamMember.findMany({
      include: {
        employmentType: true,
        workRecords: {
          orderBy: { workDate: 'desc' },
          take: 1,
          include: { site: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const todayStr = new Date().toISOString().slice(0, 10);

    return teamMembers.map(({ workRecords, ...teamMember }) => {
      const mostRecent = workRecords[0];
      const isToday =
        mostRecent &&
        mostRecent.workDate.toISOString().slice(0, 10) === todayStr;
      return {
        ...teamMember,
        currentOrLastSite: mostRecent ? mostRecent.site.name : null,
        todaysAttendance: isToday
          ? mostRecent.attended
            ? 'PRESENT'
            : 'ABSENT'
          : null,
      };
    });
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
      include: { employmentType: true },
    });
    if (!teamMember) {
      throw new NotFoundException(`Team Member ${id} not found`);
    }
    return teamMember;
  }

  // FR-21 AC #1: every Work Record for this person, chronologically,
  // across all Sites.
  async getWorkHistory(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
    });
    if (!teamMember) {
      throw new NotFoundException(`Team Member ${id} not found`);
    }
    return this.prisma.workRecord.findMany({
      where: { teamMemberId: id },
      include: { site: true },
      orderBy: { workDate: 'desc' },
    });
  }

  // FR-37 AC #3/#4: every total here is a genuine aggregate query, not a
  // maintained counter or an Epic-7-awareness branch — Payment/Advance/
  // AdvanceAdjustment already exist in the schema with zero rows until
  // Epic 7 ships, so a plain SUM() against them already returns 0, which
  // Prisma's `_sum` reports as `null` — coerced to 0 here so the frontend
  // never has to distinguish "no data yet" from "zero total."
  // `options.today` lets a caller pin the "working today" headcount to a
  // specific calendar day — the Dashboard (Story 12.1) passes its
  // local-timezone day boundary so the Labour figure lines up with its other
  // same-day tiles instead of lagging by up to a full day near UTC midnight.
  // Omitted, it defaults to the previous naive-UTC behavior, so the Team page
  // controller's existing call is unaffected.
  async getTeamSummary(options: { today?: Date } = {}) {
    const now = new Date();
    const today = options.today ?? new Date(now.toISOString().slice(0, 10));
    const dayOfWeek = now.getUTCDay() === 0 ? 7 : now.getUTCDay(); // Monday = 1
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - (dayOfWeek - 1));
    weekStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const [totalTeamMembers, workingToday, weeklyPayments, monthlyPayments] =
      await Promise.all([
        this.prisma.teamMember.count({ where: { isActive: true } }),
        this.prisma.workRecord.findMany({
          where: { workDate: today, attended: true },
          distinct: ['teamMemberId'],
          select: { teamMemberId: true },
        }),
        this.prisma.payment.aggregate({
          where: { paidAt: { gte: weekStart } },
          _sum: { netPayable: true },
        }),
        this.prisma.payment.aggregate({
          where: { paidAt: { gte: monthStart } },
          _sum: { netPayable: true },
        }),
      ]);

    return {
      totalTeamMembers,
      todaysWorkingHeadcount: workingToday.length,
      weeklyPaymentTotal: weeklyPayments._sum.netPayable?.toNumber() ?? 0,
      monthlyPaymentTotal: monthlyPayments._sum.netPayable?.toNumber() ?? 0,
    };
  }

  // Story 7.4 (AC #1): a single aggregate over TeamMember.outstandingAdvanceBalance
  // — Story 7.1's materialized, write-path-only column — never a
  // re-derivation from Advance/AdvanceAdjustment history. "Reconciles
  // exactly" is true by construction here, the same way Epic 5 Story 5.7's
  // stock reconciliation was. Every Team Member is returned, including a
  // ₹0 balance — never silently dropped, or the list would look
  // incomplete rather than accurate.
  async getOutstandingAdvances() {
    const [teamMembers, aggregate] = await Promise.all([
      this.prisma.teamMember.findMany({
        select: { id: true, name: true, outstandingAdvanceBalance: true },
        orderBy: { outstandingAdvanceBalance: 'desc' },
      }),
      this.prisma.teamMember.aggregate({
        _sum: { outstandingAdvanceBalance: true },
      }),
    ]);

    return {
      total: aggregate._sum.outstandingAdvanceBalance?.toNumber() ?? 0,
      byTeamMember: teamMembers.map((t) => ({
        teamMemberId: t.id,
        name: t.name,
        outstandingAdvanceBalance: t.outstandingAdvanceBalance,
      })),
    };
  }

  // Disabling is a normal in-place update, not one of AD-9's append-only
  // transaction-history tables — Team Member is master data (AC #4).
  async update(id: string, input: UpdateTeamMemberInput) {
    try {
      return await this.prisma.teamMember.update({
        where: { id },
        data: input,
        include: { employmentType: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Team Member ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // An employmentTypeId that doesn't exist must be a clean 400, not a raw
  // 500 — same pattern as MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Team Member references an Employment Type that does not exist',
      );
    }
    return error;
  }
}
