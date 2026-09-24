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
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { SiteContractsService } from './site-contracts.service';

// Class-level @Roles('OWNER_ADMIN') is the default; handlers override with
// their own empty @Roles() to open individually (Reflector.getAllAndOverride
// checks handler-level metadata before class-level).
//
// `create` (revised 2026-09-24, user-requested): a Site Engineer creates a
// Site Contract too now — this is exactly the "+ Create Site Contract"
// quick-create embedded in a DSR Subcontractor row (site-contract-quick-
// create-modal.tsx), which a Site Engineer routinely needs while filing a
// Daily Report, same as syncMissingSiteContracts already silently
// auto-creates a bare Draft one server-side regardless of role. `update`
// stays Owner/Admin-only: correcting an already-engaged contract's
// commercial terms after the fact (Edit terms) is the money/hiring
// decision this controller was originally locked down for, not the act of
// registering the engagement itself.
@UseGuards(RolesGuard)
@Roles('OWNER_ADMIN')
@Controller('site-contracts')
export class SiteContractsController {
  constructor(private readonly siteContractsService: SiteContractsService) {}

  @Post()
  @Roles()
  @UsePipes(new ZodValidationPipe(createSiteContractSchema))
  create(@CurrentUser() user: AuthUser, @Body() body: CreateSiteContractInput) {
    return this.siteContractsService.create(body, user.id);
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
