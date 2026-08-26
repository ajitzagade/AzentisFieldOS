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
  createMachineryTypeSchema,
  updateMachineryTypeSchema,
  type CreateMachineryTypeInput,
  type UpdateMachineryTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MachineryTypesService } from './machinery-types.service';

// Story 14.3 (FR-49): create + the new rename/disable PATCH. Reads stay open;
// only the admin write (PATCH) is @Roles('OWNER_ADMIN').
@Controller('machinery-types')
@UseGuards(RolesGuard)
export class MachineryTypesController {
  constructor(private readonly machineryTypesService: MachineryTypesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMachineryTypeSchema))
  create(@Body() body: CreateMachineryTypeInput) {
    return this.machineryTypesService.create(body);
  }

  @Get()
  list() {
    return this.machineryTypesService.list();
  }

  @Patch(':id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMachineryTypeSchema))
    body: UpdateMachineryTypeInput,
  ) {
    return this.machineryTypesService.update(id, body);
  }
}
