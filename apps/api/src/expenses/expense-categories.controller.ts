import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
  type CreateExpenseCategoryInput,
  type UpdateExpenseCategoryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ExpenseCategoriesService } from './expense-categories.service';

// Story 14.3 (FR-49): create + the new rename/disable PATCH. Reads stay open
// (the Expense entry form consumes list()); only the admin write (PATCH) is
// @Roles('OWNER_ADMIN').
@Controller('expense-categories')
@UseGuards(RolesGuard)
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

  @Patch(':id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateExpenseCategorySchema))
    body: UpdateExpenseCategoryInput,
  ) {
    return this.expenseCategoriesService.update(id, body);
  }
}
