import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateExpenseInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface ExpenseListFilters {
  siteId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export interface ExpenseSummary {
  totalThisMonth: number;
  totalThisWeek: number;
  // null when no Expenses fall in the current month — the zero-Expenses
  // case is a graceful "no data", not an error (Story 11.1 Task 5).
  largestCategoryThisMonth: { name: string; total: number } | null;
}

// Expense rows are written two ways: through DsrService's transaction
// (Epic 3's DSR-embedded expenses array) or standalone via create() below
// (Epic 11) — a diesel/petrol/labour-welfare/misc expense recorded
// directly against a Site, not tied to a Daily Site Report. Append-only
// (AD-9): create() only ever inserts — a correction is a new signed-delta
// row linked via correctsId, never an update/delete.
@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExpenseInput) {
    if (input.correctsId) {
      const original = await this.prisma.expense.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Expense ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same Site and Category as the Expense it corrects
      // (same rule as RmcService.create).
      if (
        original.siteId !== input.siteId ||
        original.categoryId !== input.categoryId
      ) {
        throw new BadRequestException(
          "A correction's Site and Category must match the Expense it corrects",
        );
      }
    }

    try {
      return await this.prisma.expense.create({
        data: { ...input, incurredAt: new Date(input.incurredAt) },
        include: { site: true, category: true },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // FR-41 / AC #2: queryable by Site, Category, and date range so the
  // Expense list and Financial reporting can slice committed history —
  // filter params on the one list endpoint, not several.
  list(filters: ExpenseListFilters = {}) {
    const where: Prisma.ExpenseWhereInput = {};
    if (filters.siteId) {
      where.siteId = filters.siteId;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.from || filters.to) {
      const incurredAt: { gte?: Date; lt?: Date } = {};
      if (filters.from) {
        incurredAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        // `to` names a calendar day and is inclusive of that whole day.
        const toEnd = new Date(filters.to);
        toEnd.setDate(toEnd.getDate() + 1);
        incurredAt.lt = toEnd;
      }
      where.incurredAt = incurredAt;
    }

    return this.prisma.expense.findMany({
      where,
      include: { site: true, category: true },
      orderBy: { incurredAt: 'desc' },
    });
  }

  // The correction form (apps/web) needs the original Expense's fields to
  // pre-fill from — same reasoning as RmcService.findOne.
  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { site: true, category: true },
    });
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }
    return expense;
  }

  // Task 4's Expense list stat tiles — server-computed aggregates over
  // committed history (same reasoning as RmcService.statsThisMonth): no
  // materialized column, these are read-only reporting figures, not a
  // race-safe current-state value.
  async summary(): Promise<ExpenseSummary> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const whereThisMonth: Prisma.ExpenseWhereInput = {
      incurredAt: { gte: monthStart, lt: nextMonthStart },
    };

    // Week starts Monday, server-local — same server-local convention the
    // rest of the codebase's stat-tile queries use.
    const weekStart = startOfWeek(now);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const [monthAgg, weekAgg, byCategory] = await Promise.all([
      this.prisma.expense.aggregate({
        where: whereThisMonth,
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { incurredAt: { gte: weekStart, lt: nextWeekStart } },
        _sum: { amount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['categoryId'],
        where: whereThisMonth,
        _sum: { amount: true },
      }),
    ]);

    let largestCategoryThisMonth: { name: string; total: number } | null = null;
    if (byCategory.length > 0) {
      const top = byCategory.reduce((max, row) =>
        (row._sum.amount?.toNumber() ?? 0) > (max._sum.amount?.toNumber() ?? 0)
          ? row
          : max,
      );
      const category = await this.prisma.expenseCategory.findUnique({
        where: { id: top.categoryId },
      });
      if (category) {
        largestCategoryThisMonth = {
          name: category.name,
          total: top._sum.amount?.toNumber() ?? 0,
        };
      }
    }

    return {
      totalThisMonth: monthAgg._sum.amount?.toNumber() ?? 0,
      totalThisWeek: weekAgg._sum.amount?.toNumber() ?? 0,
      largestCategoryThisMonth,
    };
  }

  // A siteId/categoryId that doesn't exist must be a clean 400, not a raw
  // 500 — same pattern as RmcService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Expense references a Site or Category that does not exist',
      );
    }
    return error;
  }
}

// Monday-start week containing `date`, at local midnight.
function startOfWeek(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay(); // 0 = Sun .. 6 = Sat
  const diffToMonday = (day + 6) % 7;
  start.setDate(start.getDate() - diffToMonday);
  return start;
}
