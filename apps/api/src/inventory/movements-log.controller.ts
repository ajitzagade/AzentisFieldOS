import { Controller, Get, Query } from '@nestjs/common';
import { MovementsLogService } from './movements-log.service';

// The Movements page's combined, paginated view over Purchase/Movement/
// Consumption/ReturnWastage — a new route, distinct from MovementsController
// (`/movements`, Movement rows only). Plain @Query() reads, no Zod pipe,
// matching SitesController's list() convention for GET filters.
@Controller('movements-log')
export class MovementsLogController {
  constructor(private readonly movementsLogService: MovementsLogService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('type') type?: string,
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.movementsLogService.list({
      q,
      page,
      pageSize,
      type,
      siteId,
      from,
      to,
      sort,
      order,
    });
  }
}
