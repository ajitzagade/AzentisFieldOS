import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateConsumptionInput,
  InventoryReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Consumption, Prisma } from '../generated/prisma/client';

type ConsumptionListRow = Prisma.ConsumptionGetPayload<{
  include: {
    site: true;
    materialSize: { include: { material: { include: { unit: true } } } };
  };
}>;
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';
import { giveBackConsumptionStock, takeConsumptionStock } from './stock-delta';

// FR-12: Site Supervisor or Owner/Admin records Material Consumption at a
// Site against an activity reference.
@Injectable()
export class ConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  // Story 1.8's attribution rule: `recordedByUserId` is the authenticated
  // user threaded in from the controller, never a client-supplied field.
  async create(input: CreateConsumptionInput, recordedByUserId: string) {
    let original: Consumption | null = null;
    if (input.correctsId) {
      original = await this.prisma.consumption.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Material Used entry ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same Site/Material Size as the Consumption it
      // corrects, or its quantity delta would apply to the wrong balance.
      if (
        original.siteId !== input.siteId ||
        original.materialSizeId !== input.materialSizeId
      ) {
        throw new BadRequestException(
          "A correction's Site and Material Size must match the Material Used entry it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Bugfix (2026-09-23, extended in review loop 1): plain create (no
        // correctsId) draws Site Stock first, then falls back to Godown
        // Stock for the shortfall, exactly like the DSR's Materials Used
        // path. A correction's signed delta routes through the same
        // primitives: a positive delta (increase) is a fresh draw —
        // site-first-then-Godown, identical to a plain create — and a
        // negative delta (decrease) is a give-back, but proportioned to
        // the *original* row's own recorded split, never blindly credited
        // to Site Stock alone (that would corrupt both balances for any
        // row that was ever Godown-sourced). Every row — plain or
        // correction — persists the exact split it produced.
        const split = original
          ? await this.applyCorrectionStockDelta(tx, input, original)
          : await takeConsumptionStock(
              tx,
              input.siteId,
              input.materialSizeId,
              input.quantity,
              'Not enough Site Stock for this Material Used entry.',
            );

        return tx.consumption.create({
          data: {
            ...input,
            recordedByUserId,
            consumedAt: new Date(input.consumedAt),
            siteStockQuantity: split.siteStockQuantity,
            godownStockQuantity: split.godownStockQuantity,
          },
        });
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // A correction's `input.quantity` is a signed delta, not an absolute
  // amount (per `createConsumptionSchema`'s `correctsId` branch) — there is
  // no fresh Consumption row to draw against, only the effect this delta
  // has on top of the original. An increase is exactly a fresh
  // takeConsumptionStock draw. A decrease must give back to the same
  // locations the *original* row actually drew from, in the same
  // proportion — never a guessed policy (e.g. Site-only, or Godown-first) —
  // or a correction on a Godown-sourced row would silently corrupt both
  // balances. `godownAmount` is computed as the remainder (not
  // `giveBackAmount * godownRatio`) so the two legs always sum to exactly
  // `giveBackAmount` regardless of floating-point rounding.
  private async applyCorrectionStockDelta(
    tx: Prisma.TransactionClient,
    input: CreateConsumptionInput,
    original: Consumption,
  ): Promise<{ siteStockQuantity: number; godownStockQuantity: number }> {
    const delta = input.quantity;
    if (delta > 0) {
      return takeConsumptionStock(
        tx,
        input.siteId,
        input.materialSizeId,
        delta,
        'Not enough Site Stock for this Material Used entry.',
      );
    }

    const giveBackAmount = -delta;
    const originalQuantity = original.quantity.toNumber();
    const originalSite = original.siteStockQuantity.toNumber();
    const siteRatio =
      originalQuantity !== 0 ? originalSite / originalQuantity : 0;
    const siteAmount = giveBackAmount * siteRatio;
    const godownAmount = giveBackAmount - siteAmount;

    await giveBackConsumptionStock(
      tx,
      input.siteId,
      input.materialSizeId,
      siteAmount,
      godownAmount,
    );

    // Stored signed, matching the row's own (negative) quantity — so
    // `siteStockQuantity + godownStockQuantity === quantity` holds for
    // every Consumption row, correction or not.
    return {
      siteStockQuantity: -siteAmount,
      godownStockQuantity: -godownAmount,
    };
  }

  // Story 13.2 (FR-43): the same Consumption list, optionally narrowed by
  // Site / Material / date window. Rows belonging to a superseded (since
  // corrected) DSR are excluded — the correction's restated rows already
  // represent that report, so including both would double-count.
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior is unchanged.
  async list(
    filters: InventoryReportFilters = {},
  ): Promise<ConsumptionListRow[] | PaginatedResult<ConsumptionListRow>> {
    const superseded = await supersededDsrIds(this.prisma);
    const where: Prisma.ConsumptionWhereInput = {
      ...this.reportWhere(filters),
      ...currentDsrRowsWhere(superseded),
    };
    const include = {
      site: true,
      materialSize: { include: { material: { include: { unit: true } } } },
    };
    const orderBy: Prisma.ConsumptionOrderByWithRelationInput = {
      consumedAt: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.consumption.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.consumption.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.consumption.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  private reportWhere(
    filters: InventoryReportFilters,
  ): Prisma.ConsumptionWhereInput {
    const where: Prisma.ConsumptionWhereInput = {};
    if (filters.siteId) where.siteId = filters.siteId;
    if (filters.materialId) {
      where.materialSize = { materialId: filters.materialId };
    }
    where.consumedAt = dateRangeBounds(filters.from, filters.to);
    return where;
  }

  async findOne(id: string) {
    const consumption = await this.prisma.consumption.findUnique({
      where: { id },
      include: {
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!consumption) {
      throw new NotFoundException(`Material Used entry ${id} not found`);
    }
    return consumption;
  }

  // Story 16.6: the global Search palette's Consumption coverage — matches
  // the linked Site/Material name plus the activity reference and free-text
  // notes. Superseded (since-corrected) DSR rows are excluded, same as
  // list(). `superseded` is computed once by the caller (SearchService) and
  // shared across every entity that needs it — DsrService/WorkRecordsService
  // ask for the identical tenant-wide set on every search request, so
  // computing it here too would mean 3 redundant, concurrent, unbounded
  // scans of "every corrected DSR" per keystroke.
  async searchCandidates(
    q: string,
    superseded: string[],
  ): Promise<{
    candidates: Prisma.ConsumptionGetPayload<{
      include: { site: true; materialSize: { include: { material: true } } };
    }>[];
    total: number;
  }> {
    // AND, not spread — both this method's own `OR` (query matching) and
    // currentDsrRowsWhere's `OR` (supersession filter) use the same key;
    // spreading one after the other would silently drop the first.
    const where: Prisma.ConsumptionWhereInput = {
      AND: [
        currentDsrRowsWhere(superseded),
        {
          OR: [
            { site: { name: { contains: q, mode: 'insensitive' as const } } },
            {
              materialSize: {
                material: {
                  name: { contains: q, mode: 'insensitive' as const },
                },
              },
            },
            {
              activityReference: {
                contains: q,
                mode: 'insensitive' as const,
              },
            },
            { notes: { contains: q, mode: 'insensitive' as const } },
          ],
        },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.consumption.findMany({
        where,
        include: {
          site: true,
          materialSize: { include: { material: true } },
        },
        orderBy: { consumedAt: 'desc' },
        take: 200,
      }),
      this.prisma.consumption.count({ where }),
    ]);
    return { candidates, total };
  }

  // A siteId/materialSizeId/recordedByUserId that doesn't exist must be a
  // clean 400, not a raw 500 — same pattern as PurchasesService.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Material Used entry references a Site, Material Size, or User that does not exist',
      );
    }
    return error;
  }
}
