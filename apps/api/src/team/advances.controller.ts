import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  createAdvanceSchema,
  type CreateAdvanceInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdvancesService } from './advances.service';

@Controller('advances')
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAdvanceSchema))
  create(@Body() body: CreateAdvanceInput) {
    return this.advancesService.create(body);
  }

  @Get()
  list() {
    return this.advancesService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advancesService.findOne(id);
  }
}
