import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateDailyLabourerInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma, type DailyLabourer } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';

const DAILY_LABOURER_SORT_FIELDS = ['name', 'category'] as const;
type DailyLabourerSortField = (typeof DAILY_LABOURER_SORT_FIELDS)[number];

function isDailyLabourerSortField(
  value: string | undefined,
): value is DailyLabourerSortField {
  return (
    Boolean(value) &&
    (DAILY_LABOURER_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

export interface DailyLabourersListQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

@Injectable()
export class DailyLabourersService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateDailyLabourerInput) {
    return this.prisma.dailyLabourer.create({ data: input });
  }

  // Mirrors VendorsService.list's shape exactly (same paginationParams(),
  // same DailyLabourer[] | PaginatedResult<DailyLabourer> return pattern) —
  // `q` matches name OR category (`contains`, case-insensitive), per the ask.
  list(
    query: DailyLabourersListQuery = {},
  ): Promise<DailyLabourer[] | PaginatedResult<DailyLabourer>> {
    const { q, sort, order } = query;
    const where: Prisma.DailyLabourerWhereInput = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { category: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const orderBy: Prisma.DailyLabourerOrderByWithRelationInput =
      isDailyLabourerSortField(sort)
        ? { [sort]: isSortOrder(order) ? order : 'asc' }
        : { name: 'asc' };

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.dailyLabourer.findMany({ where, orderBy });
    }

    return Promise.all([
      this.prisma.dailyLabourer.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.dailyLabourer.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  async findOne(id: string) {
    const labourer = await this.prisma.dailyLabourer.findUnique({
      where: { id },
    });
    if (!labourer) {
      throw new NotFoundException(`Labourer ${id} not found`);
    }
    return labourer;
  }
}
