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
  createAdvanceSchema,
  type CreateAdvanceInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdvancesService } from './advances.service';

@Controller('advances')
export class AdvancesController {
  constructor(private readonly advancesService: AdvancesService) {}

  // Money movement — Owner/Admin only. Reads stay open to any authenticated
  // user (e.g. a Supervisor viewing a Team Member's outstanding balance).
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createAdvanceSchema))
  create(@Body() body: CreateAdvanceInput) {
    return this.advancesService.create(body);
  }

  // `teamMemberId` was already supported by AdvancesService.list()'s
  // LabourReportFilters (the Labour Report threads it through) but never
  // exposed as a query param here — the Team Member detail page's Advance
  // Ledger fetched the tenant's entire history and filtered client-side
  // instead. `page`/`pageSize` are opt-in (paginationParams) — omitted,
  // this stays the full, unfiltered list every existing caller relies on.
  @Get()
  list(
    @Query('teamMemberId') teamMemberId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.advancesService.list({ teamMemberId, page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advancesService.findOne(id);
  }
}
