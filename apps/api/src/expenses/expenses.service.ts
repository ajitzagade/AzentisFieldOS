import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateExpenseInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';

const EXPENSE_SORT_FIELDS = [
  'incurredAt',
  'amount',
  'description',
  'paymentMethod',
  'personOrVendor',
] as const;
type ExpenseSortField = (typeof EXPENSE_SORT_FIELDS)[number];

function isExpenseSortField(
  value: string | undefined,
): value is ExpenseSortField {
  return (
    Boolean(value) &&
    (EXPENSE_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

export interface ExpenseListFilters {
  siteId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
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
  // filter params on the one list endpoint, not several. Expenses
  // belonging to a superseded (since corrected) DSR are excluded — the
  // correction's restated rows already represent that report (same rule
  // as ConsumptionService.list).
  async list(
    filters: ExpenseListFilters = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
    const where: Prisma.ExpenseWhereInput = {
      ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
    };
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
    if (filters.q) {
      where.AND = [
        {
          OR: [
            { description: { contains: filters.q, mode: 'insensitive' } },
            { personOrVendor: { contains: filters.q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const include = { site: true, category: true };
    const orderBy: Prisma.ExpenseOrderByWithRelationInput = isExpenseSortField(
      filters.sort,
    )
      ? { [filters.sort]: isSortOrder(filters.order) ? filters.order : 'asc' }
      : { incurredAt: 'desc' };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.expense.findMany({ where, include, orderBy });
    }

    const [rows, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.expense.count({ where }),
    ]);
    return {
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
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
    const currentRows = currentDsrRowsWhere(
      await supersededDsrIds(this.prisma),
    );
    const whereThisMonth: Prisma.ExpenseWhereInput = {
      incurredAt: { gte: monthStart, lt: nextMonthStart },
      ...currentRows,
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
        where: {
          incurredAt: { gte: weekStart, lt: nextWeekStart },
          ...currentRows,
        },
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

  // Story 19.2: the global Search palette's Expense coverage — same
  // q-matching fields as list() (description, personOrVendor), and the
  // same superseded-DSR exclusion so a corrected-away entry never surfaces.
  // `superseded` is precomputed once by SearchService and shared across
  // every entity that needs it — see ConsumptionService.searchCandidates
  // for why (this method used to call supersededDsrIds() itself, tripling
  // that unbounded scan on every keystroke alongside Consumption/
  // WorkRecords/Dsr's own independent calls).
  async searchCandidates(
    q: string,
    superseded: string[],
  ): Promise<{
    candidates: Prisma.ExpenseGetPayload<{
      include: { site: true; category: true };
    }>[];
    total: number;
  }> {
    const where: Prisma.ExpenseWhereInput = {
      ...currentDsrRowsWhere(superseded),
      // Nested under AND, not a top-level OR — see RmcService.searchCandidates
      // for why a second top-level OR here would clobber currentDsrRowsWhere's.
      AND: [
        {
          OR: [
            { description: { contains: q, mode: 'insensitive' as const } },
            { personOrVendor: { contains: q, mode: 'insensitive' as const } },
          ],
        },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: { site: true, category: true },
        orderBy: { incurredAt: 'desc' },
        take: 200,
      }),
      this.prisma.expense.count({ where }),
    ]);
    return { candidates, total };
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
