import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  createConsumptionSchema,
  type CreateConsumptionInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ConsumptionService } from './consumption.service';

@Controller('consumption')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createConsumptionSchema))
  create(@Body() body: CreateConsumptionInput) {
    return this.consumptionService.create(body);
  }

  @Get()
  list() {
    return this.consumptionService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumptionService.findOne(id);
  }
}
