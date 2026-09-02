import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createSiteContractSchema,
  updateSiteContractSchema,
  type CreateSiteContractInput,
  type UpdateSiteContractInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SiteContractsService } from './site-contracts.service';

// Every handler here is Owner/Admin-only (@UseGuards at controller level
// with @Roles on the class-equivalent — see each handler): engaging a
// Subcontractor and setting commercial terms is a money/hiring decision,
// unlike Story 18.3's Work Entries, which is the Supervisor-facing surface
// in this feature area.
@UseGuards(RolesGuard)
@Roles('OWNER_ADMIN')
@Controller('site-contracts')
export class SiteContractsController {
  constructor(private readonly siteContractsService: SiteContractsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createSiteContractSchema))
  create(@Body() body: CreateSiteContractInput) {
    return this.siteContractsService.create(body);
  }

  // Read-only, open to both roles despite the class-level @Roles('OWNER_ADMIN')
  // above: RolesGuard's Reflector.getAllAndOverride checks handler-level
  // metadata before class-level, so this handler's own @Roles() (empty
  // array) wins and short-circuits to unrestricted — Story 18.5's Site and
  // Subcontractor detail pages (both roles) need this list.
  @Get()
  @Roles()
  list(
    @Query('siteId') siteId?: string,
    @Query('subcontractorId') subcontractorId?: string,
    @Query('status') status?: string,
  ) {
    return this.siteContractsService.list({ siteId, subcontractorId, status });
  }

  // FR-63: Owner Dashboard's outstanding-to-Subcontractors StatTile. Static
  // paths declared before the `:id` wildcard below — same route-ordering
  // discipline as PurchasesController's `count/pending-pricing` (Nest
  // matches in declaration order for same-shape paths).
  @Get('outstanding-summary')
  @Roles()
  outstandingSummary() {
    return this.siteContractsService.outstandingSummary();
  }

  // D7-shaped: how many Site Contracts are still Draft with missing terms
  // — drives the Owner Dashboard's gap-flag.
  @Get('count/draft-pending-terms')
  @Roles()
  countDraftPendingTerms() {
    return this.siteContractsService.countDraftPendingTerms();
  }

  @Get(':id')
  @Roles()
  findOne(@Param('id') id: string) {
    return this.siteContractsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSiteContractSchema))
    body: UpdateSiteContractInput,
  ) {
    return this.siteContractsService.update(id, body);
  }
}
