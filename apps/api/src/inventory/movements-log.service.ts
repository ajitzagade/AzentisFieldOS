import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { dateRangeBounds } from '../common/date-range';
import { isSortOrder } from '../common/sort-order';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';

export type MovementLogType =
  'PURCHASE' | 'MOVEMENT' | 'CONSUMPTION' | 'RETURN_WASTAGE';

const MOVEMENT_LOG_TYPES: readonly MovementLogType[] = [
  'PURCHASE',
  'MOVEMENT',
  'CONSUMPTION',
  'RETURN_WASTAGE',
];

function isMovementLogType(
  value: string | undefined,
): value is MovementLogType {
  return (
    Boolean(value) && MOVEMENT_LOG_TYPES.includes(value as MovementLogType)
  );
}

export interface MovementsLogQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  // Raw, unvalidated query-string value — an unrecognized value is
  // treated as "no filter" (every source queried) via `isMovementLogType`,
  // never silently zeroing every `want*` flag the way a strict-but-unchecked
  // union type invites.
  type?: string;
  siteId?: string;
  from?: string;
  to?: string;
  // The only sortable column: the four merged sources share no other
  // comparable field, so `date` is the sole recognized value — anything
  // else keeps the default date-descending order.
  sort?: string;
  order?: string;
}

export interface MovementLogRow {
  type: MovementLogType;
  id: string;
  date: Date;

  item: any;
}

const materialSizeInclude = {
  materialSize: { include: { material: { include: { unit: true } } } },
} as const;

// Merging four independently unbounded, unpaginated transaction tables into
// one date-ordered page without raw SQL. The trick: fetching the top
// `skip + take` rows (by date desc) from EACH source and merging is
// guaranteed to contain the true top `skip + take` rows overall — a row
// outside its own source's top-N can never be in the merged top-N either,
// since N rows from its own source already outrank it. This keeps every
// query a plain Prisma `findMany`, at the cost of re-fetching more rows
// from each source as the page number grows (an accepted, documented
// tradeoff — deep pagination gets more expensive, never incorrect).
@Injectable()
export class MovementsLogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: MovementsLogQuery,
  ): Promise<PaginatedResult<MovementLogRow>> {
    const { q, type, siteId, from, to } = query;
    const pagination = paginationParams(query.page, query.pageSize);
    const page = pagination.paginated ? pagination.page : 1;
    const pageSize = pagination.paginated ? pagination.pageSize : 25;
    const limit = page * pageSize;
    const dateRange = dateRangeBounds(from, to);
    const dateDirection: 'asc' | 'desc' =
      query.sort === 'date' && isSortOrder(query.order) ? query.order : 'desc';

    const knownType = isMovementLogType(type) ? type : undefined;
    const wantPurchase = !knownType || knownType === 'PURCHASE';
    const wantMovement = !knownType || knownType === 'MOVEMENT';
    const wantConsumption = !knownType || knownType === 'CONSUMPTION';
    const wantReturnWastage = !knownType || knownType === 'RETURN_WASTAGE';

    const purchaseSearch = q
      ? {
          OR: [
            {
              materialSize: {
                material: {
                  name: { contains: q, mode: 'insensitive' as const },
                },
              },
            },
            { site: { name: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {};
    const siteSearch = (
      siteRelation: 'site' | 'sourceSite' | 'destinationSite',
    ) =>
      q
        ? {
            OR: [
              {
                materialSize: {
                  material: {
                    name: { contains: q, mode: 'insensitive' as const },
                  },
                },
              },
              {
                [siteRelation]: {
                  name: { contains: q, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {};

    // Built once per table and reused for both `findMany` and `count` —
    // the two must always agree on the filtered universe, or `total`
    // silently drifts from what the rows actually show.
    const purchaseWhere: Prisma.PurchaseWhereInput = {
      ...(siteId ? { siteId } : {}),
      ...(dateRange ? { purchasedAt: dateRange } : {}),
      ...purchaseSearch,
    };

    const movementWhere: Prisma.MovementWhereInput = {
      ...(siteId
        ? { OR: [{ sourceSiteId: siteId }, { destinationSiteId: siteId }] }
        : {}),
      ...(dateRange ? { movedAt: dateRange } : {}),
      ...(q
        ? {
            OR: [
              {
                materialSize: {
                  material: {
                    name: { contains: q, mode: 'insensitive' as const },
                  },
                },
              },
              {
                sourceSite: {
                  name: { contains: q, mode: 'insensitive' as const },
                },
              },
              {
                destinationSite: {
                  name: { contains: q, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    // Consumption is DSR-embedded (Epic 3): a corrected DSR's restated
    // Consumption rows replace the superseded ones, so — same rule as
    // `ConsumptionService.list()` itself — a superseded row must never
    // reappear here, or a corrected report double-counts in this combined
    // feed. Purchase/Movement/ReturnWastage's own dedicated `list()`
    // methods carry no such exclusion, so none is added for them here
    // either — this keeps the combined feed consistent with each table's
    // own standalone list semantics.
    const superseded = wantConsumption
      ? await supersededDsrIds(this.prisma)
      : [];
    const consumptionSearch = siteSearch('site');
    const consumptionWhere: Prisma.ConsumptionWhereInput = {
      ...(siteId ? { siteId } : {}),
      ...(dateRange ? { consumedAt: dateRange } : {}),
      ...currentDsrRowsWhere(superseded),
      ...('OR' in consumptionSearch ? { AND: [consumptionSearch] } : {}),
    };

    const returnWastageWhere: Prisma.ReturnWastageWhereInput = {
      ...(siteId ? { siteId } : {}),
      ...(dateRange ? { recordedAt: dateRange } : {}),
      ...siteSearch('site'),
    };

    const [purchases, purchaseTotal] = wantPurchase
      ? await Promise.all([
          this.prisma.purchase.findMany({
            where: purchaseWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { purchasedAt: dateDirection },
            take: limit,
          }),
          this.prisma.purchase.count({ where: purchaseWhere }),
        ])
      : [[], 0];

    const [movements, movementTotal] = wantMovement
      ? await Promise.all([
          this.prisma.movement.findMany({
            where: movementWhere,
            include: {
              ...materialSizeInclude,
              sourceSite: true,
              destinationSite: true,
            },
            orderBy: { movedAt: dateDirection },
            take: limit,
          }),
          this.prisma.movement.count({ where: movementWhere }),
        ])
      : [[], 0];

    const [consumptions, consumptionTotal] = wantConsumption
      ? await Promise.all([
          this.prisma.consumption.findMany({
            where: consumptionWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { consumedAt: dateDirection },
            take: limit,
          }),
          this.prisma.consumption.count({ where: consumptionWhere }),
        ])
      : [[], 0];

    const [returnWastages, returnWastageTotal] = wantReturnWastage
      ? await Promise.all([
          this.prisma.returnWastage.findMany({
            where: returnWastageWhere,
            include: { ...materialSizeInclude, site: true },
            orderBy: { recordedAt: dateDirection },
            take: limit,
          }),
          this.prisma.returnWastage.count({ where: returnWastageWhere }),
        ])
      : [[], 0];

    const merged: MovementLogRow[] = [
      ...purchases.map((item: Prisma.PurchaseGetPayload<object>) => ({
        type: 'PURCHASE' as const,
        id: item.id,
        date: item.purchasedAt,
        item,
      })),
      ...movements.map((item: Prisma.MovementGetPayload<object>) => ({
        type: 'MOVEMENT' as const,
        id: item.id,
        date: item.movedAt,
        item,
      })),
      ...consumptions.map((item: Prisma.ConsumptionGetPayload<object>) => ({
        type: 'CONSUMPTION' as const,
        id: item.id,
        date: item.consumedAt,
        item,
      })),
      ...returnWastages.map((item: Prisma.ReturnWastageGetPayload<object>) => ({
        type: 'RETURN_WASTAGE' as const,
        id: item.id,
        date: item.recordedAt,
        item,
      })),
    ].sort((a, b) =>
      dateDirection === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime(),
    );

    const skip = (page - 1) * pageSize;
    const rows = merged.slice(skip, skip + pageSize);
    const total =
      purchaseTotal + movementTotal + consumptionTotal + returnWastageTotal;

    return { rows, total, page, pageSize };
  }
}
