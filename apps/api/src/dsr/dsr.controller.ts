import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
  saveDraftSchema,
  type CorrectDsrInput,
  type CreateDsrInput,
  type GetDraftQuery,
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

  // spec-dsr-drafts: Save Draft — private, produces zero module side effects
  // until Finalize. Both roles that can record a Daily Report may draft one.
  @Post('draft')
  @UseGuards(RolesGuard)
  @Roles('SITE_SUPERVISOR', 'OWNER_ADMIN')
  @UsePipes(new ZodValidationPipe(saveDraftSchema))
  saveDraft(@CurrentUser() user: AuthUser, @Body() body: SaveDraftInput) {
    return this.dsrService.saveDraft(body, user.id);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dsrService.findOne(id);
  }
}
