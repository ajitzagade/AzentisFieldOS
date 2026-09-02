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
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { paginationParams } from '../common/pagination';
import {
  currentDsrRowsWhere,
  supersededDsrIds,
} from '../common/superseded-dsrs';
import { decrementStockWithFloorCheck } from './stock-delta';

// FR-12: Site Supervisor or Owner/Admin records Material Consumption at a
// Site against an activity reference.
@Injectable()
export class ConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  // Story 1.8's attribution rule: `recordedByUserId` is the authenticated
  // user threaded in from the controller, never a client-supplied field.
  async create(input: CreateConsumptionInput, recordedByUserId: string) {
    if (input.correctsId) {
      const original = await this.prisma.consumption.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Consumption ${input.correctsId} does not exist`,
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
          "A correction's Site and Material Size must match the Consumption it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const consumption = await tx.consumption.create({
          data: {
            ...input,
            recordedByUserId,
            consumedAt: new Date(input.consumedAt),
          },
        });

        await decrementStockWithFloorCheck(
          tx,
          {
            model: 'siteStock',
            siteId: input.siteId,
            materialSizeId: input.materialSizeId,
          },
          input.quantity,
          'Not enough Site Stock for this Consumption.',
        );

        return consumption;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Story 13.2 (FR-43): the same Consumption list, optionally narrowed by
  // Site / Material / date window. Rows belonging to a superseded (since
  // corrected) DSR are excluded — the correction's restated rows already
  // represent that report, so including both would double-count.
  // Pagination is opt-in via filters.page/pageSize — omitted, the existing
  // full-array behavior is unchanged.
  async list(
    filters: InventoryReportFilters = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
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
      throw new NotFoundException(`Consumption ${id} not found`);
    }
    return consumption;
  }

  // A siteId/materialSizeId/recordedByUserId that doesn't exist must be a
  // clean 400, not a raw 500 — same pattern as PurchasesService.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Consumption references a Site, Material Size, or User that does not exist',
      );
    }
    return error;
  }
}
