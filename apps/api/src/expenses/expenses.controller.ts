import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from '@azentisfieldos/shared';
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

  // FR-41 / AC #2: queryable by Site, Category, and date range.
  @Get()
  list(
    @Query('siteId') siteId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.list({ siteId, categoryId, from, to });
  }

  // Static path declared before the `:id` wildcard below — Nest matches
  // routes in declaration order, so `:id` would otherwise swallow `summary`
  // as its param value (same reasoning as RmcController's `stats/this-month`).
  @Get('summary')
  summary() {
    return this.expensesService.summary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }
}
