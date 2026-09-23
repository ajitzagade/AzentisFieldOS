import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateDailyLabourAttendanceInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';
import {
  currentAttendanceWhere,
  supersededAttendanceIds,
} from './current-labour-attendance';
import { createDailyLabourAdvance } from './daily-labour-advance-write';

@Injectable()
export class DailyLabourAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDailyLabourAttendanceInput) {
    if (input.correctsId) {
      const original = await this.prisma.dailyLabourAttendance.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Attendance ${input.correctsId} does not exist`,
        );
      }
      if (original.labourerId !== input.labourerId) {
        throw new BadRequestException(
          "A correction's Labourer must match the Attendance row it corrects",
        );
      }
      if (original.shift !== input.shift) {
        throw new BadRequestException(
          "A correction's Shift must match the row it corrects",
        );
      }
    } else {
      const superseded = await supersededAttendanceIds(this.prisma);
      // Matches the model's own doc comment: "One row per Labourer per Site
      // per date per shift" — siteId must be part of the guard, or a
      // Labourer couldn't have an independent Day-shift row at two
      // different Sites on the same date.
      const duplicate = await this.prisma.dailyLabourAttendance.findFirst({
        where: {
          labourerId: input.labourerId,
          siteId: input.siteId,
          workDate: new Date(input.workDate),
          shift: input.shift,
          ...currentAttendanceWhere(superseded),
        },
      });
      if (duplicate) {
        throw new BadRequestException(
          `This Labourer already has a ${input.shift === 'DAY' ? 'Day' : 'Night'} entry for this date — correct it instead`,
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const attendance = await tx.dailyLabourAttendance.create({
          data: {
            labourerId: input.labourerId,
            siteId: input.siteId,
            workDate: new Date(input.workDate),
            shift: input.shift,
            isHalfDay: input.isHalfDay,
            attended: input.attended,
            perDayAmount: input.perDayAmount,
            correctsId: input.correctsId,
            correctionReason: input.correctionReason,
          },
        });

        if (input.advance) {
          await createDailyLabourAdvance(tx, {
            labourerId: input.labourerId,
            amount: input.advance.amount,
            description: input.advance.description,
            givenAt: new Date(input.workDate),
          });
        }

        return attendance;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // The Labourer detail page's Sun-Sat calendar — current (non-superseded)
  // rows only, so a corrected day never double-counts toward totalEarned.
  async listForLabourer(labourerId: string, from?: string, to?: string) {
    const superseded = await supersededAttendanceIds(this.prisma);
    return this.prisma.dailyLabourAttendance.findMany({
      where: {
        labourerId,
        workDate: dateRangeBounds(from, to),
        ...currentAttendanceWhere(superseded),
      },
      include: { site: true },
      orderBy: { workDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const attendance = await this.prisma.dailyLabourAttendance.findUnique({
      where: { id },
      include: { site: true, labourer: true },
    });
    if (!attendance) {
      throw new NotFoundException(`Attendance ${id} not found`);
    }
    return attendance;
  }

  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Attendance entry references a Labourer or Site that does not exist',
      );
    }
    return error;
  }
}
