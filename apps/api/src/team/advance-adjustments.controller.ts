import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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

  // `teamMemberId` was already supported by AdvanceAdjustmentsService.list()
  // (via the parent Advance's teamMemberId) but never exposed as a query
  // param here — same gap as AdvancesController.list(). `page`/`pageSize`
  // are opt-in (paginationParams) — omitted, this stays the full,
  // unfiltered list every existing caller relies on.
  @Get()
  list(
    @Query('teamMemberId') teamMemberId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.advanceAdjustmentsService.list({
      teamMemberId,
      page,
      pageSize,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advanceAdjustmentsService.findOne(id);
  }
}
