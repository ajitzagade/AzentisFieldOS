import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateReturnWastageInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decrementStockWithFloorCheck } from './stock-delta';

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

  list() {
    return this.prisma.returnWastage.findMany({
      include: {
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { recordedAt: 'desc' },
    });
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
