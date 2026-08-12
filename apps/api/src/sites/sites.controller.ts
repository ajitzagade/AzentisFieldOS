import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import {
  createSiteSchema,
  updateSiteSchema,
  type CreateSiteInput,
  type UpdateSiteInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { SitesService } from './sites.service';

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

  @Get()
  list() {
    return this.sitesService.list();
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateSiteSchema))
  update(@Param('id') id: string, @Body() body: UpdateSiteInput) {
    return this.sitesService.update(id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sitesService.findOne(id);
  }
}
