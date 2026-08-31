import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateVendorInput,
  UpdateVendorInput,
  PaginatedResult,
} from '@azentisfieldos/shared';
import { Prisma, type Vendor } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PurchasesService } from '../inventory/purchases.service';
import { paginationParams } from '../common/pagination';
import { isSortOrder } from '../common/sort-order';

const VENDOR_SORT_FIELDS = ['name', 'contactPerson', 'phone'] as const;
type VendorSortField = (typeof VENDOR_SORT_FIELDS)[number];

function isVendorSortField(
  value: string | undefined,
): value is VendorSortField {
  return (
    Boolean(value) &&
    (VENDOR_SORT_FIELDS as readonly string[]).includes(value as string)
  );
}

export interface VendorsListQuery {
  q?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

// FR-39: Owner/Admin creates and maintains Vendor records.
@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchasesService: PurchasesService,
  ) {}

  create(input: CreateVendorInput) {
    return this.prisma.vendor.create({ data: input });
  }

  list(
    query: VendorsListQuery = {},
  ): Promise<Vendor[] | PaginatedResult<Vendor>> {
    const { q, sort, order } = query;
    // Soft-deleted Vendors are hidden from every list/picker (their rows
    // and purchase history stay in the database).
    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
    };
    const orderBy: Prisma.VendorOrderByWithRelationInput = isVendorSortField(
      sort,
    )
      ? { [sort]: isSortOrder(order) ? order : 'asc' }
      : { name: 'asc' };

    const pagination = paginationParams(query.page, query.pageSize);
    if (!pagination.paginated) {
      return this.prisma.vendor.findMany({ where, orderBy });
    }

    return Promise.all([
      this.prisma.vendor.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.vendor.count({ where }),
    ]).then(([rows, total]) => ({
      rows,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
    }));
  }

  // Vendor master data uses a normal in-place update — it is not one of
  // AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateVendorInput) {
    // A soft-deleted Vendor is inert: not readable, not editable (the 404
    // contract applies to writes too).
    await this.findOne(id);
    try {
      return await this.prisma.vendor.update({ where: { id }, data: input });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Vendor ${id} not found`);
      }
      throw error;
    }
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor || vendor.deletedAt) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }
    return vendor;
  }

  // Soft delete — same rule as SitesService.softDelete: stamp deletedAt,
  // never a hard DELETE (purchases/RMC/disposals keep their vendor FK).
  async softDelete(id: string) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor || vendor.deletedAt) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }
    return this.prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Story 9.2, AC #1/#3: this Vendor's Purchase history, delegated to
  // PurchasesService's existing query capability rather than a second
  // Prisma query over Purchase.
  async purchases(id: string) {
    await this.findOne(id);
    return this.purchasesService.listByVendor(id);
  }

  // Story 9.2, AC #4.
  async purchaseSummary(id: string) {
    await this.findOne(id);
    return this.purchasesService.summaryForVendor(id);
  }
}
