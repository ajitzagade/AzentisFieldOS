import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import {
  createExpenseCategorySchema,
  type CreateExpenseCategoryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ExpenseCategoriesService } from './expense-categories.service';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createExpenseCategorySchema))
  create(@Body() body: CreateExpenseCategoryInput) {
    return this.expenseCategoriesService.create(body);
  }

  @Get()
  list() {
    return this.expenseCategoriesService.list();
  }
}
