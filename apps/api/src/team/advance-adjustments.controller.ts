import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import {
  createAdvanceAdjustmentSchema,
  type CreateAdvanceAdjustmentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AdvanceAdjustmentsService } from './advance-adjustments.service';

@Controller('advance-adjustments')
export class AdvanceAdjustmentsController {
  constructor(
    private readonly advanceAdjustmentsService: AdvanceAdjustmentsService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAdvanceAdjustmentSchema))
  create(@Body() body: CreateAdvanceAdjustmentInput) {
    return this.advanceAdjustmentsService.create(body);
  }

  @Get()
  list() {
    return this.advanceAdjustmentsService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advanceAdjustmentsService.findOne(id);
  }
}
