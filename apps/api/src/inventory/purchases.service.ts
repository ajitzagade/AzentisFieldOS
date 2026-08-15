import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreatePurchaseInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-8: Owner/Admin records a Purchase into Godown or a Site directly.
@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreatePurchaseInput) {
    if (input.correctsId) {
      const original = await this.prisma.purchase.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Purchase ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same Material Size/destination/Site as the Purchase
      // it corrects, or its quantity delta would apply to the wrong
      // GodownStock/SiteStock row.
      if (
        original.materialSizeId !== input.materialSizeId ||
        original.destination !== input.destination ||
        original.siteId !== (input.siteId ?? null)
      ) {
        throw new BadRequestException(
          "A correction's Material Size, destination, and Site must match the Purchase it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: { ...input, purchasedAt: new Date(input.purchasedAt) },
        });

        if (input.destination === 'GODOWN') {
          await tx.godownStock.upsert({
            where: { materialSizeId: input.materialSizeId },
            update: { quantity: { increment: input.quantity } },
            create: {
              materialSizeId: input.materialSizeId,
              quantity: input.quantity,
            },
          });
        } else {
          await tx.siteStock.upsert({
            where: {
              siteId_materialSizeId: {
                siteId: input.siteId!,
                materialSizeId: input.materialSizeId,
              },
            },
            update: { quantity: { increment: input.quantity } },
            create: {
              siteId: input.siteId!,
              materialSizeId: input.materialSizeId,
              quantity: input.quantity,
            },
          });
        }

        return purchase;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  list() {
    return this.prisma.purchase.findMany({
      include: {
        vendor: true,
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  // Story 5.7's Inventory page "Purchases This Month" stat tile — a count
  // query, not a client-side filter over the full unbounded Purchase list.
  countThisMonth() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.prisma.purchase.count({
      where: { purchasedAt: { gte: monthStart, lt: nextMonthStart } },
    });
  }

  // The correction form (apps/web) needs the original Purchase's fields to
  // pre-fill from — not in Task 2's endpoint list, but required by Task 3.
  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        vendor: true,
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!purchase) {
      throw new NotFoundException(`Purchase ${id} not found`);
    }
    return purchase;
  }

  // A vendorId/materialSizeId/siteId that doesn't exist must be a clean
  // 400, not a raw 500 — same pattern as MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Purchase references a Vendor, Material Size, or Site that does not exist',
      );
    }
    return error;
  }
}
