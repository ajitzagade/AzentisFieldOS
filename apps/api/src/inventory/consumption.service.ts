import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateConsumptionInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decrementStockWithFloorCheck } from './stock-delta';

// FR-12: Site Supervisor or Owner/Admin records Material Consumption at a
// Site against an activity reference.
@Injectable()
export class ConsumptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateConsumptionInput) {
    if (input.correctsId) {
      const original = await this.prisma.consumption.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Consumption ${input.correctsId} does not exist`,
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const consumption = await tx.consumption.create({
          data: { ...input, consumedAt: new Date(input.consumedAt) },
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

  list() {
    return this.prisma.consumption.findMany({
      include: {
        site: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { consumedAt: 'desc' },
    });
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
