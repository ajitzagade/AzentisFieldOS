import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateExpenseInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Expense rows are written two ways: through DsrService's transaction
// (Epic 3's DSR-embedded expenses array) or standalone via create() below
// (Epic 11) — a diesel/petrol/labour-welfare/misc expense recorded
// directly against a Site, not tied to a Daily Site Report.
@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExpenseInput) {
    try {
      return await this.prisma.expense.create({
        data: { ...input, incurredAt: new Date(input.incurredAt) },
        include: { site: true, category: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'This Expense references a Site or Category that does not exist',
        );
      }
      throw error;
    }
  }

  list() {
    return this.prisma.expense.findMany({
      include: { site: true, category: true },
      orderBy: { incurredAt: 'desc' },
    });
  }
}
