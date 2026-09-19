import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateWasteDisposalInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';

export interface WasteDisposalListFilters {
  siteId?: string;
  vendorId?: string;
  from?: string;
  to?: string;
  // Opt-in pagination — see paginationParams. Absent on every existing
  // caller (list/summary share this type), which must keep getting the
  // full, unbounded result exactly as before.
  page?: string;
  pageSize?: string;
}

export interface WasteDisposalSummary {
  totalCost: number;
  totalTrips: number;
  own: { cost: number; trips: number };
  hired: { cost: number; trips: number };
  byVendor: { vendorId: string; name: string; cost: number; trips: number }[];
  byWasteType: { wasteType: string; cost: number; trips: number }[];
  bySite: { siteId: string; name: string; cost: number; trips: number }[];
}

const DISPOSAL_INCLUDE = {
  site: { select: { id: true, name: true } },
  vendor: { select: { id: true, name: true } },
  machinery: { select: { id: true, name: true } },
  vehicle: { select: { id: true, number: true } },
} satisfies Prisma.WasteDisposalInclude;

type WasteDisposalListRow = Prisma.WasteDisposalGetPayload<{
  include: typeof DISPOSAL_INCLUDE;
}>;

// Per-record settlement position (feature 2026-09-19): the advance money
// already handed to the trip's Vendor and what is still pending — so the
// list answers "how much do I still owe for this trip" without a detour to
// the Vendor page. Null on OWN rows (no party to pay) and on correction
// rows (their money is folded into the root entry's figures).
export type WasteDisposalSettledRow = WasteDisposalListRow & {
  advanceTotal: Prisma.Decimal | null;
  pendingAmount: Prisma.Decimal | null;
};

const ZERO = new Prisma.Decimal(0);

// Waste & Disposal — a per-trip disposal COST ledger (FR-41 spirit: money
// leaving the business, attributed to a Site). Append-only (AD-9):
// create() only ever inserts; a correction is a new signed-delta row
// linked via correctsId, never an update/delete. `totalAmount` is always
// computed here (tripCount × ratePerTrip + otherCharges — signed on
// corrections), never accepted from the client: the Purchase/RMC
// correction-money defect this codebase already had is not repeatable
// when the server owns the arithmetic.
@Injectable()
export class WasteDisposalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateWasteDisposalInput, recordedByUserId: string) {
    if (input.correctsId) {
      const original = await this.prisma.wasteDisposal.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Waste Disposal ${input.correctsId} does not exist`,
        );
      }
      // A correction is a signed adjustment to the SAME activity — Site,
      // waste type, ownership, party, and rate must all match the original
      // (same rule as ExpensesService/RmcService corrections). A different
      // rate/party is a new activity, not a correction of this one.
      if (
        original.siteId !== input.siteId ||
        original.wasteType !== input.wasteType ||
        original.ownership !== input.ownership ||
        (original.vendorId ?? undefined) !== input.vendorId ||
        !original.ratePerTrip.equals(new Prisma.Decimal(input.ratePerTrip))
      ) {
        throw new BadRequestException(
          "A correction's Site, waste type, ownership, party and rate must match the entry it corrects",
        );
      }
    }

    // Exact Decimal arithmetic, signed on corrections (negative tripCount /
    // otherCharges deltas produce a negative totalAmount delta).
    const totalAmount = new Prisma.Decimal(input.tripCount)
      .mul(new Prisma.Decimal(input.ratePerTrip))
      .add(new Prisma.Decimal(input.otherCharges ?? 0));

    // `advance` is a separate VendorAdvance row (its own table), not a
    // WasteDisposal column — pulled out before spreading `input` into the
    // create() call below so Prisma never sees an unrecognized key.
    const { advance, ...disposalInput } = input;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const disposal = await tx.wasteDisposal.create({
          data: {
            ...disposalInput,
            otherCharges: disposalInput.otherCharges ?? 0,
            totalAmount,
            disposedAt: new Date(disposalInput.disposedAt),
            recordedByUserId,
          },
          include: DISPOSAL_INCLUDE,
        });

        if (advance) {
          // createWasteDisposalSchema guarantees `advance` only ever
          // arrives alongside a HIRED disposal, which itself requires
          // vendorId — see that schema's own superRefine.
          await tx.vendorAdvance.create({
            data: {
              vendorId: disposal.vendorId!,
              wasteDisposalId: disposal.id,
              amount: advance.amount,
              paymentMethod: advance.paymentMethod,
              givenAt: disposal.disposedAt,
            },
          });
        }

        return disposal;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior is unchanged.
  async list(
    filters: WasteDisposalListFilters = {},
  ): Promise<
    WasteDisposalSettledRow[] | PaginatedResult<WasteDisposalSettledRow>
  > {
    const where = this.whereFor(filters);
    const orderBy: Prisma.WasteDisposalOrderByWithRelationInput = {
      disposedAt: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      const rows = await this.prisma.wasteDisposal.findMany({
        where,
        include: DISPOSAL_INCLUDE,
        orderBy,
      });
      return this.withSettlement(rows);
    }

    const [rows, total] = await Promise.all([
      this.prisma.wasteDisposal.findMany({
        where,
        include: DISPOSAL_INCLUDE,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.wasteDisposal.count({ where }),
    ]);
    return {
      rows: await this.withSettlement(rows),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
  }

  // Attaches advanceTotal/pendingAmount to each HIRED root row. An advance
  // only ever attaches to a root entry (createWasteDisposalSchema forbids
  // `advance` on a correction), but the trip's own money can be corrected —
  // corrections are signed-delta rows, so a root's true bill is its own
  // totalAmount plus every delta in its correction chain, and its effective
  // payment status is the latest non-null one in that chain (the correction
  // form is also how UNPAID becomes PAID). Pending is therefore:
  //   0 when effectively PAID, else (net bill − advances given);
  // negative pending = more advanced than billed (recovers on future trips,
  // same convention as a Site Contract's negative outstanding).
  private async withSettlement(
    rows: WasteDisposalListRow[],
  ): Promise<WasteDisposalSettledRow[]> {
    const roots = rows.filter((r) => !r.correctsId && r.vendorId);
    const notApplicable = (
      r: WasteDisposalListRow,
    ): WasteDisposalSettledRow => ({
      ...r,
      advanceTotal: null,
      pendingAmount: null,
    });
    if (roots.length === 0) {
      return rows.map(notApplicable);
    }

    const rootIds = roots.map((r) => r.id);
    const advanceGroups = await this.prisma.vendorAdvance.groupBy({
      by: ['wasteDisposalId'],
      where: { wasteDisposalId: { in: rootIds } },
      _sum: { amount: true },
    });
    const advanceByRoot = new Map(
      advanceGroups.map((g) => [g.wasteDisposalId, g._sum.amount ?? ZERO]),
    );

    // Walk the correction chain breadth-first (a correction can itself be
    // corrected), attributing every delta back to its chain root.
    const deltaByRoot = new Map<string, Prisma.Decimal>();
    const statusByRoot = new Map(
      roots.map((r) => [r.id, { at: r.createdAt, status: r.paymentStatus }]),
    );
    const rootOf = new Map(rootIds.map((id) => [id, id]));
    let frontier = rootIds;
    while (frontier.length > 0) {
      const corrections = await this.prisma.wasteDisposal.findMany({
        where: { correctsId: { in: frontier } },
        select: {
          id: true,
          correctsId: true,
          totalAmount: true,
          paymentStatus: true,
          createdAt: true,
        },
      });
      if (corrections.length === 0) break;
      frontier = [];
      for (const c of corrections) {
        const root = rootOf.get(c.correctsId!)!;
        rootOf.set(c.id, root);
        deltaByRoot.set(
          root,
          (deltaByRoot.get(root) ?? ZERO).add(c.totalAmount),
        );
        const current = statusByRoot.get(root)!;
        if (c.paymentStatus && c.createdAt >= current.at) {
          statusByRoot.set(root, { at: c.createdAt, status: c.paymentStatus });
        }
        frontier.push(c.id);
      }
    }

    return rows.map((r) => {
      if (r.correctsId || !r.vendorId) return notApplicable(r);
      const advanceTotal = advanceByRoot.get(r.id) ?? ZERO;
      const netBill = r.totalAmount.add(deltaByRoot.get(r.id) ?? ZERO);
      const pendingAmount =
        statusByRoot.get(r.id)!.status === 'PAID'
          ? ZERO
          : netBill.sub(advanceTotal);
      return { ...r, advanceTotal, pendingAmount };
    });
  }

  // The Owner view: total disposal cost, trips, own-vs-hired split, and
  // vendor / waste-type / Site breakdowns — all within the same optional
  // Site + date window the list uses, so the tiles and the table beneath
  // them reconcile by construction. Corrections are signed-delta rows, so
  // plain SUMs are already correct — no supersedence filter needed
  // (unlike DSR-nested tables).
  async summary(
    filters: WasteDisposalListFilters = {},
  ): Promise<WasteDisposalSummary> {
    const rows = await this.prisma.wasteDisposal.findMany({
      where: this.whereFor(filters),
      include: DISPOSAL_INCLUDE,
    });

    const summary: WasteDisposalSummary = {
      totalCost: 0,
      totalTrips: 0,
      own: { cost: 0, trips: 0 },
      hired: { cost: 0, trips: 0 },
      byVendor: [],
      byWasteType: [],
      bySite: [],
    };
    const vendorBuckets = new Map<
      string,
      { vendorId: string; name: string; cost: number; trips: number }
    >();
    const wasteTypeBuckets = new Map<
      string,
      { wasteType: string; cost: number; trips: number }
    >();
    const siteBuckets = new Map<
      string,
      { siteId: string; name: string; cost: number; trips: number }
    >();

    for (const row of rows) {
      const cost = row.totalAmount.toNumber();
      const trips = row.tripCount;
      summary.totalCost += cost;
      summary.totalTrips += trips;
      const split = row.ownership === 'OWN' ? summary.own : summary.hired;
      split.cost += cost;
      split.trips += trips;

      if (row.vendor) {
        const bucket = vendorBuckets.get(row.vendor.id) ?? {
          vendorId: row.vendor.id,
          name: row.vendor.name,
          cost: 0,
          trips: 0,
        };
        bucket.cost += cost;
        bucket.trips += trips;
        vendorBuckets.set(row.vendor.id, bucket);
      }

      const typeBucket = wasteTypeBuckets.get(row.wasteType) ?? {
        wasteType: row.wasteType,
        cost: 0,
        trips: 0,
      };
      typeBucket.cost += cost;
      typeBucket.trips += trips;
      wasteTypeBuckets.set(row.wasteType, typeBucket);

      const siteBucket = siteBuckets.get(row.site.id) ?? {
        siteId: row.site.id,
        name: row.site.name,
        cost: 0,
        trips: 0,
      };
      siteBucket.cost += cost;
      siteBucket.trips += trips;
      siteBuckets.set(row.site.id, siteBucket);
    }

    const byCostDesc = <T extends { cost: number }>(a: T, b: T) =>
      b.cost - a.cost;
    summary.byVendor = [...vendorBuckets.values()].sort(byCostDesc);
    summary.byWasteType = [...wasteTypeBuckets.values()].sort(byCostDesc);
    summary.bySite = [...siteBuckets.values()].sort(byCostDesc);
    return summary;
  }

  // The correction form needs the original's fields to pre-fill from —
  // same reasoning as ExpensesService.findOne. Settlement figures ride
  // along so a detail consumer sees the same advance/pending the list does.
  async findOne(id: string): Promise<WasteDisposalSettledRow> {
    const disposal = await this.prisma.wasteDisposal.findUnique({
      where: { id },
      include: DISPOSAL_INCLUDE,
    });
    if (!disposal) {
      throw new NotFoundException(`Waste Disposal ${id} not found`);
    }
    const [settled] = await this.withSettlement([disposal]);
    return settled!;
  }

  // Story 16.6: the global Search palette's Waste Disposal coverage —
  // matches the linked Site/Vendor name, the waste type, and free-text
  // notes.
  async searchCandidates(q: string): Promise<{
    candidates: WasteDisposalListRow[];
    total: number;
  }> {
    const where: Prisma.WasteDisposalWhereInput = {
      OR: [
        { site: { name: { contains: q, mode: 'insensitive' as const } } },
        { vendor: { name: { contains: q, mode: 'insensitive' as const } } },
        { wasteType: { contains: q, mode: 'insensitive' as const } },
        { notes: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.wasteDisposal.findMany({
        where,
        include: DISPOSAL_INCLUDE,
        orderBy: { disposedAt: 'desc' },
        take: 200,
      }),
      this.prisma.wasteDisposal.count({ where }),
    ]);
    return { candidates, total };
  }

  private whereFor(
    filters: WasteDisposalListFilters,
  ): Prisma.WasteDisposalWhereInput {
    const where: Prisma.WasteDisposalWhereInput = {};
    if (filters.siteId) {
      where.siteId = filters.siteId;
    }
    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }
    const bounds = dateRangeBounds(filters.from, filters.to);
    if (bounds) {
      where.disposedAt = bounds;
    }
    return where;
  }

  // FK violations arrive as Prisma errors — translate to clean 400s (same
  // discipline as every other write service).
  private translateWriteError(error: unknown): Error {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'A referenced Site, Vendor, Machinery or Vehicle does not exist',
      );
    }
    return error as Error;
  }
}
