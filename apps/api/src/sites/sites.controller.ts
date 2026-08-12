import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { createSiteSchema, type CreateSiteInput } from '@azentisfieldos/shared';
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
}
