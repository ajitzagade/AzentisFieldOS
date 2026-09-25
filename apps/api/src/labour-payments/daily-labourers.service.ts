import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateDailyLabourerInput,
  PaginatedResult,
  UpdateDailyLabourerInput,
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
  // spec-dsr-labour-dropdown: GET /daily-labourers?isActive=true — the DSR
  // Labour picker's own fetch, so a deactivated Labourer never appears as a
  // pickable option. Absent (the admin list page's own call) returns every
  // Labourer regardless of isActive, unchanged from before this filter
  // existed.
  isActive?: string;
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
    const { q, sort, order, isActive } = query;
    const where: Prisma.DailyLabourerWhereInput = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { category: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      // Mirrors TeamMembersService's isActive:true-where-clause precedent
      // (getTeamSummary/searchCandidates) — only filters when the query
      // param is explicitly present, so every other caller (e.g. the admin
      // list page) keeps seeing both active and inactive Labourers.
      ...(isActive === 'true' ? { isActive: true } : {}),
      ...(isActive === 'false' ? { isActive: false } : {}),
    };
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

  // Deliberately NOT gated on isActive (unlike Vendor/Subcontractor's
  // deletedAt-null findOne) — a deactivated Labourer's own detail page,
  // and this update path, must stay reachable so their attendance/advance/
  // payment history remains viewable and correctable for future reference.
  // Only entry-flow pickers (isActive=true filter above) and the admin
  // list's default tab hide them.
  async update(id: string, input: UpdateDailyLabourerInput) {
    try {
      return await this.prisma.dailyLabourer.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Labourer ${id} not found`);
      }
      throw error;
    }
  }

  // Deactivate/Reactivate — flips isActive only, never a real DELETE.
  // DailyLabourAttendance/DailyLabourAdvance/DailyLabourWeeklyPayment all
  // carry a required labourerId FK with no cascade, so every existing row
  // (and any calculation reading it) is untouched either way.
  async setActive(id: string, isActive: boolean) {
    try {
      return await this.prisma.dailyLabourer.update({
        where: { id },
        data: { isActive },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Labourer ${id} not found`);
      }
      throw error;
    }
  }
}
