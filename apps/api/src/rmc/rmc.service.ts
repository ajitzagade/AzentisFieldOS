import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateRmcEntryInput,
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

const RMC_ENTRY_SORT_FIELDS = [
  'deliveredAt',
  'quantityM3',
  'grade',
  'ratePerM3',
  'totalAmount',
  'site',
  'vendor',
] as const;
type RmcEntrySortField = (typeof RMC_ENTRY_SORT_FIELDS)[number];

function isRmcEntrySortField(
  value: string | undefined,
): value is RmcEntrySortField {
  return (
    Boolean(value) &&
    (RMC_ENTRY_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

function rmcEntryOrderBy(
  sort: string | undefined,
  order: string | undefined,
): Prisma.RmcEntryOrderByWithRelationInput {
  if (!isRmcEntrySortField(sort)) {
    return { deliveredAt: 'desc' };
  }
  const direction = isSortOrder(order) ? order : 'asc';
  if (sort === 'site' || sort === 'vendor') {
    return { [sort]: { name: direction } };
  }
  return { [sort]: direction };
}

export interface RmcEntryListFilters {
  siteId?: string;
  vendorId?: string;
  date?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// Story 10.2: RMC reporting — the three slices are the same aggregate with
// a different grouping key, never three separate endpoints/queries.
export const RMC_REPORT_GROUP_BYS = ['day', 'site', 'vendor'] as const;
export type RmcReportGroupBy = (typeof RMC_REPORT_GROUP_BYS)[number];

export interface RmcReportFilters {
  from?: string;
  to?: string;
}

export interface RmcReportRow {
  // Grouping key: ISO calendar day (day), siteId (site), vendorId (vendor).
  key: string;
  // Human-readable label: the ISO day, Site name, or Vendor name.
  label: string;
  totalQuantityM3: number;
  totalCost: number;
  entryCount: number;
}

// FR-26: RMC deliveries are their own entity, stored separately from the
// Material Catalog/Inventory Transactions data model (AC #1) — this
// service deliberately never reads or writes GodownStock/SiteStock. RMC
// deliveries were previously write-only through DsrService's
// DSR-embedded rmcEntries array (Epic 3); this is the dedicated "record
// an RMC delivery" write path Epic 10 owns.
@Injectable()
export class RmcService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateRmcEntryInput) {
    if (input.correctsId) {
      const original = await this.prisma.rmcEntry.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `RMC delivery ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same Site/Vendor/Grade as the delivery it corrects.
      if (
        original.siteId !== input.siteId ||
        original.vendorId !== input.vendorId ||
        original.grade !== input.grade
      ) {
        throw new BadRequestException(
          "A correction's Site, Vendor, and Grade must match the RMC delivery it corrects",
        );
      }
    }

    try {
      return await this.prisma.rmcEntry.create({
        data: { ...input, deliveredAt: new Date(input.deliveredAt) },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // AC #2: queryable by day, Site, or Vendor — filter params on the one
  // list endpoint, not three separate ones. Entries belonging to a
  // superseded (since corrected) DSR are excluded — the correction's
  // restated entries already represent that report (same rule as
  // ConsumptionService.list).
  async list(
    filters: RmcEntryListFilters = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
    const where: Prisma.RmcEntryWhereInput = {
      ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
    };
    if (filters.siteId) {
      where.siteId = filters.siteId;
    }
    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }
    if (filters.date) {
      const dayStart = new Date(filters.date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.deliveredAt = { gte: dayStart, lt: dayEnd };
    }
    if (filters.q) {
      where.AND = [
        {
          OR: [
            { grade: { contains: filters.q, mode: 'insensitive' } },
            { site: { name: { contains: filters.q, mode: 'insensitive' } } },
            { vendor: { name: { contains: filters.q, mode: 'insensitive' } } },
          ],
        },
      ];
    }

    const include = { site: true, vendor: true };
    const orderBy = rmcEntryOrderBy(filters.sort, filters.order);

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.rmcEntry.findMany({ where, include, orderBy });
    }

    const [rows, total] = await Promise.all([
      this.prisma.rmcEntry.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.rmcEntry.count({ where }),
    ]);
    return {
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  // Story 10.2 / FR-27: daily, Site-wise, and Vendor-wise RMC
  // consumption/cost reporting. One grouped-aggregate method with a
  // `groupBy` key, not three near-identical queries. Every figure is a
  // live aggregate summed over the individual RmcEntry rows themselves
  // (there is no materialized rollup), so AC #1's "totals reconcile
  // exactly to the sum of individual entries" is true by construction —
  // each entry (including negative-quantity corrections, AD-9) lands in
  // exactly one bucket, so the three slices always share one grand total.
  async report(
    groupBy: RmcReportGroupBy,
    filters: RmcReportFilters = {},
  ): Promise<RmcReportRow[]> {
    const where: Prisma.RmcEntryWhereInput = {
      ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
    };
    if (filters.from || filters.to) {
      const deliveredAt: { gte?: Date; lt?: Date } = {};
      if (filters.from) {
        deliveredAt.gte = new Date(filters.from);
      }
      if (filters.to) {
        // `to` names a calendar day and is inclusive of that whole day.
        const toEnd = new Date(filters.to);
        toEnd.setDate(toEnd.getDate() + 1);
        deliveredAt.lt = toEnd;
      }
      where.deliveredAt = deliveredAt;
    }

    const entries = await this.prisma.rmcEntry.findMany({
      where,
      include: { site: true, vendor: true },
      orderBy: { deliveredAt: 'desc' },
    });

    const groups = new Map<string, RmcReportRow>();
    for (const entry of entries) {
      const { key, label } = this.reportGroupOf(entry, groupBy);
      const bucket = groups.get(key) ?? {
        key,
        label,
        totalQuantityM3: 0,
        totalCost: 0,
        entryCount: 0,
      };
      bucket.totalQuantityM3 += entry.quantityM3.toNumber();
      bucket.totalCost += entry.totalAmount.toNumber();
      bucket.entryCount += 1;
      groups.set(key, bucket);
    }

    const rows = [...groups.values()];
    // Deterministic display order: most-recent-first for the daily slice,
    // alphabetical by name for the Site/Vendor slices.
    if (groupBy === 'day') {
      rows.sort((a, b) => b.key.localeCompare(a.key));
    } else {
      rows.sort((a, b) => a.label.localeCompare(b.label));
    }
    return rows;
  }

  private reportGroupOf(
    entry: {
      deliveredAt: Date;
      siteId: string;
      vendorId: string;
      site: { name: string };
      vendor: { name: string };
    },
    groupBy: RmcReportGroupBy,
  ): { key: string; label: string } {
    if (groupBy === 'site') {
      return { key: entry.siteId, label: entry.site.name };
    }
    if (groupBy === 'vendor') {
      return { key: entry.vendorId, label: entry.vendor.name };
    }
    // day: bucket by calendar day (YYYY-MM-DD), matching the single-day
    // list() filter's UTC-midnight day boundary.
    const day = new Date(entry.deliveredAt).toISOString().slice(0, 10);
    return { key: day, label: day };
  }

  // The correction form (apps/web) needs the original RMC delivery's
  // fields to pre-fill from — same reasoning as PurchasesService.findOne.
  async findOne(id: string) {
    const entry = await this.prisma.rmcEntry.findUnique({
      where: { id },
      include: { site: true, vendor: true },
    });
    if (!entry) {
      throw new NotFoundException(`RMC delivery ${id} not found`);
    }
    return entry;
  }

  // Task 4's RMC list page stat tiles — server-computed aggregates, not a
  // client-side reduction over an unbounded list() fetch (same reasoning
  // as PurchasesService.countThisMonth).
  async statsThisMonth() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const whereThisMonth = {
      deliveredAt: { gte: monthStart, lt: nextMonthStart },
      ...currentDsrRowsWhere(await supersededDsrIds(this.prisma)),
    };

    const [aggregate, activeVendors] = await Promise.all([
      this.prisma.rmcEntry.aggregate({
        where: whereThisMonth,
        _sum: { quantityM3: true, totalAmount: true },
      }),
      this.prisma.rmcEntry.findMany({
        where: whereThisMonth,
        select: { vendorId: true },
        distinct: ['vendorId'],
      }),
    ]);

    return {
      totalQuantityM3: aggregate._sum.quantityM3?.toNumber() ?? 0,
      totalCost: aggregate._sum.totalAmount?.toNumber() ?? 0,
      activeVendorCount: activeVendors.length,
    };
  }

  // A vendorId/siteId that doesn't exist must be a clean 400, not a raw
  // 500 — same pattern as PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This RMC delivery references a Vendor or Site that does not exist',
      );
    }
    return error;
  }
}
