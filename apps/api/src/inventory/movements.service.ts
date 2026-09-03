import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ConfirmMovementReceiptInput,
  CreateMovementInput,
  InventoryReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';

type MovementListRow = Prisma.MovementGetPayload<{
  include: {
    sourceSite: true;
    destinationSite: true;
    materialSize: { include: { material: { include: { unit: true } } } };
  };
}>;
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import { decrementStockWithFloorCheck } from './stock-delta';

// FR-9: Owner/Admin records a Godown-to-Site (and, from Story 5.4,
// Site-to-Site) Movement in two steps — sent now, received on confirmation.
@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMovementInput) {
    if (input.correctsId) {
      const original = await this.prisma.movement.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Movement ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same kind/Material Size/Site(s) as the Movement it
      // corrects, or its quantity delta would apply to the wrong balance.
      if (
        original.kind !== input.kind ||
        original.materialSizeId !== input.materialSizeId ||
        original.sourceSiteId !== (input.sourceSiteId ?? null) ||
        original.destinationSiteId !== input.destinationSiteId
      ) {
        throw new BadRequestException(
          "A correction's kind, Material Size, and Site(s) must match the Movement it corrects",
        );
      }
    }

    const isGodownToSite = input.kind === 'GODOWN_TO_SITE';

    try {
      return await this.prisma.$transaction(async (tx) => {
        const movement = await tx.movement.create({
          data: { ...input, movedAt: new Date(input.movedAt) },
        });

        // Story 5.2's canonical floor check (extracted in Story 5.5 once a
        // third call site needed it) targets Godown (GODOWN_TO_SITE) or
        // the sending Site (SITE_TO_SITE) — same technique, different
        // target.
        await decrementStockWithFloorCheck(
          tx,
          isGodownToSite
            ? { model: 'godownStock', materialSizeId: input.materialSizeId }
            : {
                model: 'siteStock',
                siteId: input.sourceSiteId!,
                materialSizeId: input.materialSizeId,
              },
          input.sentQuantity,
          isGodownToSite
            ? 'Not enough Godown Stock for this Movement.'
            : "Not enough of the source Site's Stock for this Movement.",
        );

        return movement;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // AC #2: the receiving Site confirms what actually arrived — completing
  // the same event, not correcting a mistake (Dev Notes "Why confirmReceipt
  // updates a row"). Site Stock increases by receivedQuantity, never by
  // sentQuantity — a shortage/damage gap stays visible, never absorbed.
  async confirmReceipt(id: string, input: ConfirmMovementReceiptInput) {
    const movement = await this.prisma.movement.findUnique({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Movement ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // A plain findUnique-then-update has a race window: two concurrent
      // confirmReceipt calls can both read receivedQuantity: null before
      // either commits, both pass the "not yet confirmed" check, and both
      // increment SiteStock — double-counting a shortage/damage gap into
      // the balance while the Movement row itself only ever shows the
      // second caller's value. updateMany's WHERE-clause guard (the same
      // technique decrementStockWithFloorCheck uses) makes the check and
      // the write atomic: only one concurrent caller's updateMany can
      // affect a row, so only one can proceed to the SiteStock increment.
      const result = await tx.movement.updateMany({
        where: { id, receivedQuantity: null },
        data: { receivedQuantity: input.receivedQuantity },
      });
      if (result.count === 0) {
        throw new BadRequestException(
          `Movement ${id} has already had its receipt confirmed`,
        );
      }

      await tx.siteStock.upsert({
        where: {
          siteId_materialSizeId: {
            siteId: movement.destinationSiteId,
            materialSizeId: movement.materialSizeId,
          },
        },
        update: { quantity: { increment: input.receivedQuantity } },
        create: {
          siteId: movement.destinationSiteId,
          materialSizeId: movement.materialSizeId,
          quantity: input.receivedQuantity,
        },
      });

      return tx.movement.findUniqueOrThrow({ where: { id } });
    });
  }

  // Story 13.2 (FR-43): the same Movement list, optionally narrowed by Site /
  // Material / date window. A Site filter matches a Movement touching that
  // Site on either end (as source or destination), mirroring the Site
  // activity feed's OR. Unfiltered it is unchanged.
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior is unchanged.
  list(
    filters: InventoryReportFilters = {},
  ): Promise<MovementListRow[] | PaginatedResult<MovementListRow>> {
    const where = this.reportWhere(filters);
    const include = {
      sourceSite: true,
      destinationSite: true,
      materialSize: { include: { material: { include: { unit: true } } } },
    };
    const orderBy: Prisma.MovementOrderByWithRelationInput = {
      movedAt: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.movement.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.movement.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.movement.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  private reportWhere(
    filters: InventoryReportFilters,
  ): Prisma.MovementWhereInput {
    const where: Prisma.MovementWhereInput = {};
    if (filters.siteId) {
      where.OR = [
        { sourceSiteId: filters.siteId },
        { destinationSiteId: filters.siteId },
      ];
    }
    if (filters.materialId) {
      where.materialSize = { materialId: filters.materialId };
    }
    where.movedAt = dateRangeBounds(filters.from, filters.to);
    return where;
  }

  async findOne(id: string) {
    const movement = await this.prisma.movement.findUnique({
      where: { id },
      include: {
        sourceSite: true,
        destinationSite: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!movement) {
      throw new NotFoundException(`Movement ${id} not found`);
    }
    return movement;
  }

  // Story 16.6: the global Search palette's Movement coverage — Movement has
  // no name of its own, so this matches the linked Material/source-Site/
  // destination-Site name plus free-text notes.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.MovementGetPayload<{
      include: {
        sourceSite: true;
        destinationSite: true;
        materialSize: { include: { material: true } };
      };
    }>[];
    total: number;
  }> {
    const where: Prisma.MovementWhereInput = {
      OR: [
        {
          materialSize: {
            material: { name: { contains: q, mode: 'insensitive' as const } },
          },
        },
        { sourceSite: { name: { contains: q, mode: 'insensitive' as const } } },
        {
          destinationSite: {
            name: { contains: q, mode: 'insensitive' as const },
          },
        },
        { notes: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        include: {
          sourceSite: true,
          destinationSite: true,
          materialSize: { include: { material: true } },
        },
        orderBy: { movedAt: 'desc' },
        take: 200,
      }),
      this.prisma.movement.count({ where }),
    ]);
    return { candidates, total };
  }

  // A materialSizeId/sourceSiteId/destinationSiteId that doesn't exist
  // must be a clean 400, not a raw 500 — same pattern as
  // PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Movement references a Material Size or Site that does not exist',
      );
    }
    return error;
  }
}
