import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createSubcontractorSchema,
  updateSubcontractorSchema,
  type CreateSubcontractorInput,
  type UpdateSubcontractorInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubcontractorsService } from './subcontractors.service';

// RolesGuard is a no-op on handlers without @Roles() metadata, so adding it
// at controller level restricts ONLY the delete below.
@UseGuards(RolesGuard)
@Controller('subcontractors')
export class SubcontractorsController {
  constructor(private readonly subcontractorsService: SubcontractorsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createSubcontractorSchema))
  create(@Body() body: CreateSubcontractorInput) {
    return this.subcontractorsService.create(body);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.subcontractorsService.list({ q, page, pageSize, sort, order });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSubcontractorSchema))
    body: UpdateSubcontractorInput,
  ) {
    return this.subcontractorsService.update(id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcontractorsService.findOne(id);
  }

  // FR-62: this Subcontractor's full cross-Site Site Contract history —
  // Subcontractor detail page's "Site Contracts" section (Story 18.5).
  @Get(':id/contracts')
  contracts(@Param('id') id: string) {
    return this.subcontractorsService.contracts(id);
  }

  // Soft delete (Owner/Admin only) — hides the Subcontractor everywhere;
  // the row and its Site Contract/work/payment history remain untouched.
  @Delete(':id')
  @Roles('OWNER_ADMIN')
  remove(@Param('id') id: string) {
    return this.subcontractorsService.softDelete(id);
  }
}
