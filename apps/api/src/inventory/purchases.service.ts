import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CompletePurchasePricingInput,
  CreatePurchaseInput,
  InventoryReportFilters,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';

// FR-8: Owner/Admin records a Purchase into Godown or a Site directly.
@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePurchaseInput) {
    if (input.correctsId) {
      const original = await this.prisma.purchase.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Purchase ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same Material Size/destination/Site as the Purchase
      // it corrects, or its quantity delta would apply to the wrong
      // GodownStock/SiteStock row.
      if (
        original.materialSizeId !== input.materialSizeId ||
        original.destination !== input.destination ||
        original.siteId !== (input.siteId ?? null)
      ) {
        throw new BadRequestException(
          "A correction's Material Size, destination, and Site must match the Purchase it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: { ...input, purchasedAt: new Date(input.purchasedAt) },
        });

        if (input.destination === 'GODOWN') {
          await tx.godownStock.upsert({
            where: { materialSizeId: input.materialSizeId },
            update: { quantity: { increment: input.quantity } },
            create: {
              materialSizeId: input.materialSizeId,
              quantity: input.quantity,
            },
          });
        } else {
          await tx.siteStock.upsert({
            where: {
              siteId_materialSizeId: {
                siteId: input.siteId!,
                materialSizeId: input.materialSizeId,
              },
            },
            update: { quantity: { increment: input.quantity } },
            create: {
              siteId: input.siteId!,
              materialSizeId: input.materialSizeId,
              quantity: input.quantity,
            },
          });
        }

        return purchase;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 13.2 (FR-43): the same Purchase list the Inventory page shows,
  // optionally narrowed by Site / Material / date window for the Inventory
  // Reports view. Unfiltered (the default `{}`) it returns exactly what it
  // did before, so the live Inventory Transactions list is unchanged.
  list(filters: InventoryReportFilters = {}) {
    return this.prisma.purchase.findMany({
      where: this.reportWhere(filters),
      include: {
        vendor: true,
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  private reportWhere(
    filters: InventoryReportFilters,
  ): Prisma.PurchaseWhereInput {
    const where: Prisma.PurchaseWhereInput = {};
    if (filters.siteId) where.siteId = filters.siteId;
    if (filters.materialId) {
      where.materialSize = { materialId: filters.materialId };
    }
    where.purchasedAt = dateRangeBounds(filters.from, filters.to);
    return where;
  }

  // D7: a Supervisor's inward entry arrives without pricing; the Owner
  // completes it exactly once. `totalAmount IS NULL` is the pending marker.
  // This UPDATE is the deliberate, reviewed exception to AD-9's no-UPDATE
  // rule: it only ever fills fields that were recorded as "to be priced" —
  // the guard below refuses to touch a row that already carries pricing,
  // so no recorded value is ever overwritten. Post-pricing changes go
  // through the normal correction flow (POST with correctsId).
  async completePricing(id: string, input: CompletePurchasePricingInput) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } });
    if (!purchase) {
      throw new NotFoundException(`Purchase ${id} not found`);
    }
    if (purchase.totalAmount !== null) {
      throw new BadRequestException(
        'This Purchase is already priced — changes to a priced Purchase must be filed as a correction',
      );
    }
    return this.prisma.purchase.update({
      where: { id },
      data: {
        rate: input.rate,
        totalAmount: input.totalAmount,
        paymentStatus: input.paymentStatus,
      },
    });
  }

  // D7: how many inward entries still await pricing — the Dashboard
  // gap-flag's honest count (unpriced rows are excluded from every money
  // figure rather than pretending to be ₹0).
  countPendingPricing() {
    return this.prisma.purchase.count({ where: { totalAmount: null } });
  }

  // Story 5.7's Inventory page "Purchases This Month" stat tile — a count
  // query, not a client-side filter over the full unbounded Purchase list.
  countThisMonth() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.prisma.purchase.count({
      where: { purchasedAt: { gte: monthStart, lt: nextMonthStart } },
    });
  }

  // The correction form (apps/web) needs the original Purchase's fields to
  // pre-fill from — not in Task 2's endpoint list, but required by Task 3.
  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        vendor: true,
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase ${id} not found`);
    }
    return purchase;
  }

  // Story 9.2's Vendor detail page "Purchase History" section — the same
  // underlying Purchase query capability as list(), filtered to one
  // Vendor, so VendorsService never runs a second, parallel Prisma query
  // over this table.
  listByVendor(vendorId: string) {
    return this.prisma.purchase.findMany({
      where: { vendorId },
      include: {
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  // Story 9.2's Vendor list/detail "amount outstanding" figures. See that
  // story's Dev Notes for why `notFullyPaidTotal` is the honest aggregate
  // ("value of Purchases not marked PAID") rather than a claimed exact
  // amount due — this data model has no field tracking how much of a
  // PARTIAL Purchase has actually been paid.
  async summaryForVendor(vendorId: string) {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const nextYearStart = new Date(now.getFullYear() + 1, 0, 1);

    const [thisYear, notFullyPaid] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: { vendorId, purchasedAt: { gte: yearStart, lt: nextYearStart } },
        _sum: { totalAmount: true },
      }),
      this.prisma.purchase.aggregate({
        // Explicit statuses, not `not: 'PAID'` — an unpriced (D7 "Pricing
        // pending", paymentStatus NULL) Purchase must not count as owed
        // money; it is surfaced through countPendingPricing instead.
        where: { vendorId, paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      totalThisYear: thisYear._sum.totalAmount?.toNumber() ?? 0,
      notFullyPaidTotal: notFullyPaid._sum.totalAmount?.toNumber() ?? 0,
    };
  }

  // A vendorId/materialSizeId/siteId that doesn't exist must be a clean
  // 400, not a raw 500 — same pattern as MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Purchase references a Vendor, Material Size, or Site that does not exist',
      );
    }
    return error;
  }
}
