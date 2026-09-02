import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createAdvanceAdjustmentSchema,
  type CreateAdvanceAdjustmentInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdvanceAdjustmentsService } from './advance-adjustments.service';

@Controller('advance-adjustments')
export class AdvanceAdjustmentsController {
  constructor(
    private readonly advanceAdjustmentsService: AdvanceAdjustmentsService,
  ) {}

  // Money movement — Owner/Admin only (mirrors AdvancesController).
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
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
