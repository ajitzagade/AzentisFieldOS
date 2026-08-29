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
  createUnitSchema,
  updateUnitSchema,
  type CreateUnitInput,
  type UpdateUnitInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UnitsService } from './units.service';

// FR-49: create + the rename/disable PATCH. Reads stay open; only the admin
// write (PATCH) is @Roles('OWNER_ADMIN').
@Controller('units')
@UseGuards(RolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUnitSchema))
  create(@Body() body: CreateUnitInput) {
    return this.unitsService.create(body);
  }

  @Get()
  list() {
    return this.unitsService.list();
  }

  @Patch(':id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUnitSchema)) body: UpdateUnitInput,
  ) {
    return this.unitsService.update(id, body);
  }
}
