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

  @Get()
  list() {
    return this.advancesService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advancesService.findOne(id);
  }
}
