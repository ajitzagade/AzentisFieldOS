import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }
}
