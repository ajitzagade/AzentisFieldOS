import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  createPurchaseSchema,
  type CreatePurchaseInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPurchaseSchema))
  create(@Body() body: CreatePurchaseInput) {
    return this.purchasesService.create(body);
  }

  @Get()
  list() {
    return this.purchasesService.list();
  }

  @Get('count/this-month')
  countThisMonth() {
    return this.purchasesService.countThisMonth();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }
}
