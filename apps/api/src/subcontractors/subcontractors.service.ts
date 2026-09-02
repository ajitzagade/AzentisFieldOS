import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateSubcontractorInput,
  UpdateSubcontractorInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma, type Subcontractor } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';
import { SiteContractsService } from './site-contracts.service';

const SUBCONTRACTOR_SORT_FIELDS = ['name', 'contactPerson', 'phone'] as const;
type SubcontractorSortField = (typeof SUBCONTRACTOR_SORT_FIELDS)[number];

function isSubcontractorSortField(
  value: string | undefined,
): value is SubcontractorSortField {
  return (
    Boolean(value) &&
    (SUBCONTRACTOR_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

export interface SubcontractorsListQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-55: Owner/Admin creates and maintains Subcontractor records. Mirrors
// VendorsService — Subcontractor master data uses a normal in-place update,
// it is not one of AD-9's append-only transaction-history tables.
@Injectable()
export class SubcontractorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly siteContractsService: SiteContractsService,
  ) {}

  create(input: CreateSubcontractorInput) {
    return this.prisma.subcontractor.create({ data: input });
  }

  list(
    query: SubcontractorsListQuery = {},
  ): Promise<Subcontractor[] | PaginatedResult<Subcontractor>> {
    const { q, sort, order } = query;
    const where: Prisma.SubcontractorWhereInput = {
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
    };
    const orderBy: Prisma.SubcontractorOrderByWithRelationInput =
      isSubcontractorSortField(sort)
        ? { [sort]: isSortOrder(order) ? order : 'asc' }
        : { name: 'asc' };

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.subcontractor.findMany({ where, orderBy });
    }

    return Promise.all([
      this.prisma.subcontractor.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.subcontractor.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  async update(id: string, input: UpdateSubcontractorInput) {
    // A soft-deleted Subcontractor is inert: not readable, not editable.
    await this.findOne(id);
    try {
      return await this.prisma.subcontractor.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Subcontractor ${id} not found`);
      }
      throw error;
    }
  }

  async findOne(id: string) {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id },
    });
    if (!subcontractor || subcontractor.deletedAt) {
      throw new NotFoundException(`Subcontractor ${id} not found`);
    }
    return subcontractor;
  }

  // FR-62: this Subcontractor's full cross-Site Site Contract history,
  // delegated to SiteContractsService.list rather than a second Prisma
  // query — same "don't duplicate the read path" pattern
  // VendorsService.purchases follows for PurchasesService.listByVendor.
  async contracts(id: string) {
    await this.findOne(id);
    return this.siteContractsService.list({ subcontractorId: id });
  }

  // Soft delete — same rule as VendorsService.softDelete: stamp deletedAt,
  // never a hard DELETE (Site Contracts keep their subcontractorId FK).
  async softDelete(id: string) {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id },
    });
    if (!subcontractor || subcontractor.deletedAt) {
      throw new NotFoundException(`Subcontractor ${id} not found`);
    }
    return this.prisma.subcontractor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Story 19.2: the global Search palette's Subcontractor coverage — mirrors
  // VendorsService.searchCandidates.
  async searchCandidates(
    q: string,
  ): Promise<{ candidates: Subcontractor[]; total: number }> {
    const where: Prisma.SubcontractorWhereInput = {
      deletedAt: null,
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { contactPerson: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.subcontractor.findMany({
        where,
        orderBy: { name: 'asc' },
        take: 200,
      }),
      this.prisma.subcontractor.count({ where }),
    ]);
    return { candidates, total };
  }
}
