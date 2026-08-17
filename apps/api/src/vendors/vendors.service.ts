import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateVendorInput,
  UpdateVendorInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PurchasesService } from '../inventory/purchases.service';

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

  list() {
    return this.prisma.vendor.findMany({ orderBy: { name: 'asc' } });
  }

  // Vendor master data uses a normal in-place update — it is not one of
  // AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateVendorInput) {
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
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }
    return vendor;
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
