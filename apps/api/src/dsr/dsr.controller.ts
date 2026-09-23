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
  correctDsrSchema,
  createDsrSchema,
  draftIdParamSchema,
  getDraftQuerySchema,
  reassignDsrSiteDateSchema,
  saveDraftSchema,
  type CorrectDsrInput,
  type CreateDsrInput,
  type GetDraftQuery,
  type ReassignDsrSiteDateInput,
  type SaveDraftInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ZodQueryValidationPipe } from '../common/zod-query-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { DsrService } from './dsr.service';

@Controller('dsr')
export class DsrController {
  constructor(private readonly dsrService: DsrService) {}

  // Story 1.8 (AC #1): the DSR is attributed to the real signed-in user
  // (req.user, resolved by ClerkAuthGuard), threaded into the service.
  @Post()
  @UsePipes(new ZodValidationPipe(createDsrSchema))
  create(@CurrentUser() user: AuthUser, @Body() body: CreateDsrInput) {
    return this.dsrService.create(body, user.id);
  }

  @Post(':id/correct')
  @UsePipes(new ZodValidationPipe(correctDsrSchema))
  correct(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: CorrectDsrInput,
  ) {
    const { reason, ...input } = body;
    return this.dsrService.correct(id, input, reason, user.id);
  }

  // spec-dsr-reassign-site-date: Owner-only "Reassign Site/Date" — a
  // narrow, sanctioned AD-9 exception (same class as D7's Purchase-pricing
  // completion) distinct from the normal Edit/correction flow. Guard
  // checks (no correction history, no target collision) live in the
  // service; this route only gates the role.
  @Patch(':id/reassign')
  @UseGuards(RolesGuard)
  @Roles('OWNER_ADMIN')
  @UsePipes(new ZodValidationPipe(reassignDsrSiteDateSchema))
  reassignSiteDate(
    @Param('id') id: string,
    @Body() body: ReassignDsrSiteDateInput,
  ) {
    return this.dsrService.reassignSiteDate(id, body);
  }

  // spec-dsr-drafts: Save Draft — private, produces zero module side effects
  // until Finalize. Both roles that can record a Daily Report may draft one.
  @Post('draft')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  @UsePipes(new ZodValidationPipe(saveDraftSchema))
  saveDraft(@CurrentUser() user: AuthUser, @Body() body: SaveDraftInput) {
    return this.dsrService.saveDraft(body, user.id);
  }

  // "My Drafts" quick-resume (2026-09-21): every open draft belonging to the
  // caller, across every Site/date — backs the Home page's "Continue" prompt.
  // Declared before `:id` (a static path), same discipline as `draft` below.
  @Get('drafts')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  listMyDrafts(@CurrentUser() user: AuthUser) {
    return this.dsrService.listMyDrafts(user.id);
  }

  // spec-dsr-drafts: Resume — the authenticated user's own persisted draft (if
  // any) for a (site,date), for the entry form to pre-fill. Drafts are private
  // per supervisor, so the caller's id scopes the lookup. Declared before
  // `:id` so the wildcard doesn't swallow `draft`. Query params are validated
  // (siteId a uuid, date a real ISO day) so a malformed request 400s instead
  // of reaching Prisma as an Invalid Date.
  @Get('draft')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  getDraft(
    @CurrentUser() user: AuthUser,
    @Query(new ZodQueryValidationPipe(getDraftQuerySchema))
    query: GetDraftQuery,
  ) {
    return this.dsrService.getDraft(query.siteId, query.date, user.id);
  }

  // spec-dsr-drafts: Discard — hard-deletes the caller's own draft and its
  // hidden photos. Refuses a SUBMITTED id (409); a malformed id 400s.
  @Delete('draft/:id')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  deleteDraft(
    @CurrentUser() user: AuthUser,
    @Param('id', new ZodQueryValidationPipe(draftIdParamSchema)) id: string,
  ) {
    return this.dsrService.deleteDraft(id, user.id);
  }

  // spec-dsr-drafts: Finalize — DRAFT -> SUBMITTED, materialises sub-records
  // and applies stock once. Rejects a non-draft id (409).
  @Post(':id/finalize')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  finalize(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.dsrService.finalizeDraft(id, user.id);
  }

  // Static-path routes are declared before the `:id` wildcard below — Nest
  // matches routes in declaration order, so `:id` would otherwise swallow
  // `defaults` as its param value.
  @Get('defaults')
  getDefaults(@Query('siteId') siteId: string, @Query('date') date: string) {
    return this.dsrService.getCrewDefaults(siteId, date);
  }

  @Get()
  list(@Query('date') date: string) {
    return this.dsrService.listByDate(date);
  }

  // spec-daily-reports-list-and-edit: the cross-Site "Submitted Daily
  // Reports" history list. Declared before `:id` (a static path) — same
  // discipline as `drafts`/`draft`/`defaults` above, or Nest would match
  // `history` as an `:id` param instead of this route.
  @Get('history')
  listAllSubmitted(
    @Query('siteId') siteId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.dsrService.listAllSubmitted({
      siteId,
      from,
      to,
      q,
      page,
      pageSize,
      sort,
      order,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dsrService.findOne(id);
  }
}
