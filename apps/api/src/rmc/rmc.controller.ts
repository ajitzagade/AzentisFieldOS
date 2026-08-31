import {
  BadRequestException,
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
import {
  RMC_REPORT_GROUP_BYS,
  RmcService,
  type RmcReportGroupBy,
} from './rmc.service';

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
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.rmcService.list({
      siteId,
      vendorId,
      date,
      q,
      page,
      pageSize,
      sort,
      order,
    });
  }

  // Static-path route declared before the `:id` wildcard below — Nest
  // matches routes in declaration order, so `:id` would otherwise swallow
  // `stats` as its param value (same reasoning as DsrController's
  // `defaults` route).
  @Get('stats/this-month')
  statsThisMonth() {
    return this.rmcService.statsThisMonth();
  }

  // Story 10.2 (FR-27): daily / Site-wise / Vendor-wise RMC reporting — one
  // grouped-aggregate endpoint keyed by `groupBy`, not three. Static path
  // declared before `:id` (same reasoning as `stats/this-month` above).
  @Get('report')
  report(
    @Query('groupBy') groupBy?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const resolved = groupBy ?? 'day';
    if (!RMC_REPORT_GROUP_BYS.includes(resolved as RmcReportGroupBy)) {
      throw new BadRequestException(
        `groupBy must be one of: ${RMC_REPORT_GROUP_BYS.join(', ')}`,
      );
    }
    return this.rmcService.report(resolved as RmcReportGroupBy, { from, to });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rmcService.findOne(id);
  }
}
