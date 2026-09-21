import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateDailyLabourAdvanceInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import { createDailyLabourAdvance } from './daily-labour-advance-write';

@Injectable()
export class DailyLabourAdvancesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDailyLabourAdvanceInput) {
    try {
      return await this.prisma.$transaction((tx) =>
        createDailyLabourAdvance(tx, {
          labourerId: input.labourerId,
          amount: input.amount,
          description: input.description,
          givenAt: new Date(input.givenAt),
          correctsId: input.correctsId,
          correctionReason: input.correctionReason,
        }),
      );
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  list(labourerId?: string, from?: string, to?: string) {
    return this.prisma.dailyLabourAdvance.findMany({
      where: {
        labourerId,
        givenAt: dateRangeBounds(from, to),
      },
      orderBy: { givenAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const advance = await this.prisma.dailyLabourAdvance.findUnique({
      where: { id },
      include: { labourer: true },
    });
    if (!advance) {
      throw new NotFoundException(`Advance ${id} not found`);
    }
    return advance;
  }

  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Advance references a Labourer that does not exist',
      );
    }
    return error;
  }
}
