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
  createEmploymentTypeSchema,
  updateEmploymentTypeSchema,
  type CreateEmploymentTypeInput,
  type UpdateEmploymentTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { EmploymentTypesService } from './employment-types.service';

// Story 14.3 (FR-49): create + the new rename/disable PATCH. The read paths
// (list, and the entry forms that consume it) stay open to any authenticated
// user; only the admin write (PATCH) is @Roles('OWNER_ADMIN') — a Site
// Supervisor cannot reconfigure category master data (mirrors UsersController).
@Controller('employment-types')
@UseGuards(RolesGuard)
export class EmploymentTypesController {
  constructor(
    private readonly employmentTypesService: EmploymentTypesService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createEmploymentTypeSchema))
  create(@Body() body: CreateEmploymentTypeInput) {
    return this.employmentTypesService.create(body);
  }

  @Get()
  list() {
    return this.employmentTypesService.list();
  }

  @Patch(':id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmploymentTypeSchema))
    body: UpdateEmploymentTypeInput,
  ) {
    return this.employmentTypesService.update(id, body);
  }
}
