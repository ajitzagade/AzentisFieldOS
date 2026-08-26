import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateExpenseCategoryInput,
  UpdateExpenseCategoryInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-41, NFR-4 (Story 11.1 AC #1): Owner/Admin-configurable Expense
// categories. Story 14.3 (FR-49) adds the rename/disable lifecycle Story 11.1
// deferred to Epic 14.
@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateExpenseCategoryInput) {
    try {
      return await this.prisma.expenseCategory.create({ data: input });
    } catch (error) {
      throw this.translateDuplicateNameError(error);
    }
  }

  list() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  // Story 14.3: rename/disable is a normal in-place update — Expense Category
  // is master data, not one of AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateExpenseCategoryInput) {
    try {
      return await this.prisma.expenseCategory.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Expense Category ${id} not found`);
      }
      throw this.translateDuplicateNameError(error);
    }
  }

  // ExpenseCategory.name is @unique — a duplicate name must be a clean 400,
  // not a raw 500.
  private translateDuplicateNameError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new BadRequestException(
        'An Expense Category with this name already exists',
      );
    }
    return error;
  }
}
