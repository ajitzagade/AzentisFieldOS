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
  createSiteSchema,
  updateSiteSchema,
  type CreateSiteInput,
  type UpdateSiteInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SitesService } from './sites.service';

// RolesGuard is a no-op on handlers without @Roles() metadata, so adding it
// at controller level restricts ONLY the delete below.
@UseGuards(RolesGuard)
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createSiteSchema))
  create(@Body() body: CreateSiteInput) {
    // ZodValidationPipe has already parsed/validated body against
    // createSiteSchema (AD-7) by the time this line runs.
    return this.sitesService.create(body);
  }

  // Query params are all optional and plain @Query() reads (no Zod pipe —
  // matches the reports controllers' existing convention for GET filters,
  // AD-7's shared-validator treatment is for write bodies). A request with
  // none of them behaves exactly as before this story (AC #7).
  @Get()
  list(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.sitesService.list({ status, q, page, pageSize, sort, order });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSiteSchema)) body: UpdateSiteInput,
  ) {
    return this.sitesService.update(id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(id);
  }

  @Get(':id/photos')
  getPhotos(@Param('id') id: string) {
    return this.sitesService.getPhotos(id);
  }

  // Soft delete (Owner/Admin only) — hides the Site everywhere; the row and
  // its transaction history remain in the database untouched.
  @Delete(':id')
  @Roles('OWNER_ADMIN')
  remove(@Param('id') id: string) {
    return this.sitesService.softDelete(id);
  }
}
