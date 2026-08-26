import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateRmcEntryInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RmcEntryListFilters {
  siteId?: string;
  vendorId?: string;
  date?: string;
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
  // list endpoint, not three separate ones.
  list(filters: RmcEntryListFilters = {}) {
    const where: Prisma.RmcEntryWhereInput = {};
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

    return this.prisma.rmcEntry.findMany({
      where,
      include: { site: true, vendor: true },
      orderBy: { deliveredAt: 'desc' },
    });
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
