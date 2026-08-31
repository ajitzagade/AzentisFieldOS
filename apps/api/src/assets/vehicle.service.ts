import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';

const VEHICLE_SORT_FIELDS = [
  'number',
  'driver',
  'currentStatus',
  'currentSite',
  'type',
] as const;
type VehicleSortField = (typeof VEHICLE_SORT_FIELDS)[number];

function isVehicleSortField(
  value: string | undefined,
): value is VehicleSortField {
  return (
    Boolean(value) &&
    (VEHICLE_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

function vehicleOrderBy(
  sort: string | undefined,
  order: string | undefined,
): Prisma.VehicleOrderByWithRelationInput {
  if (!isVehicleSortField(sort)) {
    return { number: 'asc' };
  }
  const direction = isSortOrder(order) ? order : 'asc';
  if (sort === 'currentSite' || sort === 'type') {
    return { [sort]: { name: direction } };
  }
  return { [sort]: direction };
}

export interface VehicleListQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-16: Owner/Admin creates and maintains the Vehicle register.
// `currentStatus`/`currentSiteId` are exclusively written by Story 8.2's
// movement-recording transaction — never accepted here, and
// createVehicleSchema/updateVehicleSchema (AD-7) already exclude them
// from the validated body, so `input` can never carry them even if a
// caller sends them.
@Injectable()
export class VehicleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVehicleInput) {
    try {
      return await this.prisma.vehicle.create({
        data: input,
        include: { type: true, currentSite: true },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Type and current Site joined in for the register list's columns
  // (story 8.1 Task 4) without a second round-trip per row. The single
  // latest movementLogs entry (Story 8.2) lets the list page's row-level
  // Correct icon link straight to that entry's correction route without an
  // N+1 fetch — a freshly-registered Vehicle with no movement history yet
  // comes back with an empty array, so the list page can omit the icon
  // rather than link to a movement that doesn't exist.
  list(
    query: VehicleListQuery = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
    const { q } = query;
    const where: Prisma.VehicleWhereInput | undefined = q
      ? { number: { contains: q, mode: 'insensitive' } }
      : undefined;
    const include = {
      type: true,
      currentSite: true,
      movementLogs: { orderBy: { movedAt: 'desc' as const }, take: 1 },
    };
    const orderBy = vehicleOrderBy(query.sort, query.order);

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.vehicle.findMany({
        ...(where ? { where } : {}),
        include,
        orderBy,
      });
    }

    return Promise.all([
      this.prisma.vehicle.findMany({
        ...(where ? { where } : {}),
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.vehicle.count(where ? { where } : undefined),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { type: true, currentSite: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle ${id} not found`);
    }
    return vehicle;
  }

  // Master data — a normal in-place update (AC #3), not one of AD-9's
  // append-only transaction-history tables.
  async update(id: string, input: UpdateVehicleInput) {
    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: input,
        include: { type: true, currentSite: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Vehicle ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // A typeId that doesn't exist (P2003) or a duplicate number (P2002,
  // @unique) must be a clean 400, not a raw 500 — same pattern as
  // MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new BadRequestException(
          'This Vehicle references a Vehicle Type that does not exist',
        );
      }
      if (error.code === 'P2002') {
        return new BadRequestException(
          'A Vehicle with this Number already exists',
        );
      }
    }
    return error;
  }
}
