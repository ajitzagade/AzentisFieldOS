import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateReturnWastageInput,
  InventoryReportFilters,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import { decrementStockWithFloorCheck } from './stock-delta';

type ReturnWastageListRow = Prisma.ReturnWastageGetPayload<{
  include: {
    site: true;
    materialSize: { include: { material: { include: { unit: true } } } };
  };
}>;

// FR-13: Owner/Admin or Site Supervisor records a Wastage or Return as its
// own transaction type, distinct from Consumption. Both kinds decrease
// Site Stock — a RETURN is material leaving the Site (back to a Vendor),
// same direction as WASTAGE (Dev Notes "RETURN direction").
@Injectable()
export class ReturnWastageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateReturnWastageInput) {
    if (input.correctsId) {
      const original = await this.prisma.returnWastage.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Return/Wastage ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same kind/Site/Material Size as the entry it
      // corrects, or its quantity delta would apply to the wrong balance.
      if (
        original.kind !== input.kind ||
        original.siteId !== input.siteId ||
        original.materialSizeId !== input.materialSizeId
      ) {
        throw new BadRequestException(
          "A correction's kind, Site, and Material Size must match the Return/Wastage entry it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const returnWastage = await tx.returnWastage.create({
          data: { ...input, recordedAt: new Date(input.recordedAt) },
        });

        await decrementStockWithFloorCheck(
          tx,
          {
            model: 'siteStock',
            siteId: input.siteId,
            materialSizeId: input.materialSizeId,
          },
          input.quantity,
          'Not enough Site Stock for this Return/Wastage entry.',
        );

        return returnWastage;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 13.2 (FR-43): the same Return/Wastage list, optionally narrowed by
  // Site / Material / date window. Unfiltered it is unchanged.
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior is unchanged.
  list(
    filters: InventoryReportFilters = {},
  ): Promise<ReturnWastageListRow[] | PaginatedResult<ReturnWastageListRow>> {
    const where = this.reportWhere(filters);
    const include = {
      site: true,
      materialSize: { include: { material: { include: { unit: true } } } },
    };
    const orderBy: Prisma.ReturnWastageOrderByWithRelationInput = {
      recordedAt: 'desc',
    };

    const pagination = paginationParams(filters.page, filters.pageSize);
    if (!pagination.paginated) {
      return this.prisma.returnWastage.findMany({ where, include, orderBy });
    }

    return Promise.all([
      this.prisma.returnWastage.findMany({
        where,
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.returnWastage.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  // Story 16.6: the global Search palette's Return/Wastage coverage —
  // distinct from the newer WasteDisposal (Epic 15) ledger; matches the
  // linked Site/Material name plus free-text notes.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.ReturnWastageGetPayload<{
      include: { site: true; materialSize: { include: { material: true } } };
    }>[];
    total: number;
  }> {
    const where: Prisma.ReturnWastageWhereInput = {
      OR: [
        { site: { name: { contains: q, mode: 'insensitive' as const } } },
        {
          materialSize: {
            material: { name: { contains: q, mode: 'insensitive' as const } },
          },
        },
        { notes: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.returnWastage.findMany({
        where,
        include: { site: true, materialSize: { include: { material: true } } },
        orderBy: { recordedAt: 'desc' },
        take: 200,
      }),
      this.prisma.returnWastage.count({ where }),
    ]);
    return { candidates, total };
  }

  private reportWhere(
    filters: InventoryReportFilters,
  ): Prisma.ReturnWastageWhereInput {
    const where: Prisma.ReturnWastageWhereInput = {};
    if (filters.siteId) where.siteId = filters.siteId;
    if (filters.materialId) {
      where.materialSize = { materialId: filters.materialId };
    }
    where.recordedAt = dateRangeBounds(filters.from, filters.to);
    return where;
  }

  async findOne(id: string) {
    const returnWastage = await this.prisma.returnWastage.findUnique({
      where: { id },
      include: {
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!returnWastage) {
      throw new NotFoundException(`Return/Wastage ${id} not found`);
    }
    return returnWastage;
  }

  // A siteId/materialSizeId that doesn't exist must be a clean 400, not a
  // raw 500 — same pattern as PurchasesService.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Return/Wastage entry references a Site or Material Size that does not exist',
      );
    }
    return error;
  }
}
