import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createRmcEntrySchema,
  type CreateRmcEntryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RmcService } from './rmc.service';

@Controller('rmc-entries')
export class RmcController {
  constructor(private readonly rmcService: RmcService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createRmcEntrySchema))
  create(@Body() body: CreateRmcEntryInput) {
    return this.rmcService.create(body);
  }

  // AC #2: queryable by day, Site, or Vendor via filter params.
  @Get()
  list(
    @Query('siteId') siteId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('date') date?: string,
  ) {
    return this.rmcService.list({ siteId, vendorId, date });
  }

  // Static-path route declared before the `:id` wildcard below — Nest
  // matches routes in declaration order, so `:id` would otherwise swallow
  // `stats` as its param value (same reasoning as DsrController's
  // `defaults` route).
  @Get('stats/this-month')
  statsThisMonth() {
    return this.rmcService.statsThisMonth();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rmcService.findOne(id);
  }
}
