import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateExpenseCategoryInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-41, NFR-4 (Story 11.1 AC #1): Owner/Admin-configurable Expense
// categories. Create+list only — no disable/rename AC exists yet (Epic 14
// owns the full admin lifecycle), same split as MachineryTypesService.
@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExpenseCategoryInput) {
    try {
      return await this.prisma.expenseCategory.create({ data: input });
    } catch (error) {
      // ExpenseCategory.name is @unique — a duplicate name must be a clean
      // 400, not a raw 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'An Expense Category with this name already exists',
        );
      }
      throw error;
    }
  }

  list() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
