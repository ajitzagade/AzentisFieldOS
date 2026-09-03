import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateMachineryInput,
  UpdateMachineryInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';

const MACHINERY_SORT_FIELDS = [
  'name',
  'assetNumber',
  'currentStatus',
  'currentSite',
  'type',
] as const;
type MachinerySortField = (typeof MACHINERY_SORT_FIELDS)[number];

function isMachinerySortField(
  value: string | undefined,
): value is MachinerySortField {
  return (
    Boolean(value) &&
    (MACHINERY_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

function machineryOrderBy(
  sort: string | undefined,
  order: string | undefined,
): Prisma.MachineryOrderByWithRelationInput {
  if (!isMachinerySortField(sort)) {
    return { name: 'asc' };
  }
  const direction = isSortOrder(order) ? order : 'asc';
  if (sort === 'currentSite' || sort === 'type') {
    return { [sort]: { name: direction } };
  }
  return { [sort]: direction };
}

export interface MachineryListQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-15: Owner/Admin creates and maintains the Machinery register.
// `currentStatus`/`currentSiteId` are exclusively written by Story 8.2's
// movement-recording transaction — never accepted here, and
// createMachinerySchema/updateMachinerySchema (AD-7) already exclude them
// from the validated body, so `input` can never carry them even if a
// caller sends them.
@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMachineryInput) {
    try {
      return await this.prisma.machinery.create({
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
  // N+1 fetch — a freshly-registered Machine with no movement history yet
  // comes back with an empty array, so the list page can omit the icon
  // rather than link to a movement that doesn't exist.
  list(
    query: MachineryListQuery = {},
  ): Promise<unknown[] | PaginatedResult<unknown>> {
    const { q } = query;
    const where: Prisma.MachineryWhereInput | undefined = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { assetNumber: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined;
    const include = {
      type: true,
      currentSite: true,
      movementLogs: { orderBy: { movedAt: 'desc' as const }, take: 1 },
    };
    const orderBy = machineryOrderBy(query.sort, query.order);

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.machinery.findMany({
        ...(where ? { where } : {}),
        include,
        orderBy,
      });
    }

    return Promise.all([
      this.prisma.machinery.findMany({
        ...(where ? { where } : {}),
        include,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.machinery.count(where ? { where } : undefined),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  async findOne(id: string) {
    const machinery = await this.prisma.machinery.findUnique({
      where: { id },
      include: { type: true, currentSite: true },
    });
    if (!machinery) {
      throw new NotFoundException(`Machinery ${id} not found`);
    }
    return machinery;
  }

  // Master data — a normal in-place update (AC #3), not one of AD-9's
  // append-only transaction-history tables.
  async update(id: string, input: UpdateMachineryInput) {
    try {
      return await this.prisma.machinery.update({
        where: { id },
        data: input,
        include: { type: true, currentSite: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Machinery ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // Story 16.6: the global Search palette's Machinery coverage — matches
  // name, asset number, operator's name (e.g. "JCB"), and Machinery Type
  // name (e.g. "Excavator"), per this story's own AC ("by name, registration,
  // or type").
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.MachineryGetPayload<{
      include: { type: true; currentSite: true };
    }>[];
    total: number;
  }> {
    const where: Prisma.MachineryWhereInput = {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { assetNumber: { contains: q, mode: 'insensitive' as const } },
        { operator: { contains: q, mode: 'insensitive' as const } },
        { type: { name: { contains: q, mode: 'insensitive' as const } } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.machinery.findMany({
        where,
        include: { type: true, currentSite: true },
        orderBy: { name: 'asc' },
        take: 200,
      }),
      this.prisma.machinery.count({ where }),
    ]);
    return { candidates, total };
  }

  // A typeId that doesn't exist (P2003) or a duplicate assetNumber
  // (P2002, @unique) must be a clean 400, not a raw 500 — same pattern as
  // MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new BadRequestException(
          'This Machine references a Machinery Type that does not exist',
        );
      }
      if (error.code === 'P2002') {
        return new BadRequestException(
          'A Machine with this Asset Number already exists',
        );
      }
    }
    return error;
  }
}
