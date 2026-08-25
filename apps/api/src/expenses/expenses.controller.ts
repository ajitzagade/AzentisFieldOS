import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { createExpenseSchema, type CreateExpenseInput } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createExpenseSchema))
  create(@Body() body: CreateExpenseInput) {
    return this.expensesService.create(body);
  }

  @Get()
  list() {
    return this.expensesService.list();
  }
}
