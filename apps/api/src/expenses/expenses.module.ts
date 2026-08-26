import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpensesService } from './expenses.service';
import { ExpenseCategoriesService } from './expense-categories.service';

@Module({
  controllers: [ExpensesController, ExpenseCategoriesController],
  providers: [ExpensesService, ExpenseCategoriesService],
})
export class ExpensesModule {}
