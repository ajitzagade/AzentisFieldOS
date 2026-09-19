import { Controller, Get, Query } from '@nestjs/common';
import { PaymentsOverviewService } from './payments-overview.service';

// Read-only aggregation (no write endpoints), un-role-gated like every
// other read surface (GET /payments, /dashboard/*) — the sidebar entry is
// Owner-facing, but hiding is de-emphasis, not access control; the real
// boundary stays on the money-movement writes in each owning module.
@Controller('payments-overview')
export class PaymentsOverviewController {
  constructor(
    private readonly paymentsOverviewService: PaymentsOverviewService,
  ) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('kind') kind?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.paymentsOverviewService.list({
      q,
      from,
      to,
      kind,
      status,
      page,
      pageSize,
      sort,
      order,
    });
  }

  @Get('summary')
  summary(@Query('from') from?: string, @Query('to') to?: string) {
    return this.paymentsOverviewService.summary(from, to);
  }
}
