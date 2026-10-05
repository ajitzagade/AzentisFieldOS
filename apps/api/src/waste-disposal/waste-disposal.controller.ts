import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createWasteDisposalSchema,
  deleteMovementEntrySchema,
  type CreateWasteDisposalInput,
  type DeleteMovementEntryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { WasteDisposalService } from './waste-disposal.service';

@Controller('waste-disposals')
export class WasteDisposalController {
  constructor(private readonly wasteDisposalService: WasteDisposalService) {}

  // The recording user comes from the session (CustomAuthGuard), the same
  // attribution rule the Consumption/DSR controllers follow — never from
  // the body.
  @Post()
  @UsePipes(new ZodValidationPipe(createWasteDisposalSchema))
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateWasteDisposalInput,
  ) {
    return this.wasteDisposalService.create(body, user.id);
  }

  // `page`/`pageSize` are opt-in (paginationParams) — omitted, this stays
  // the full, unfiltered list every existing caller relies on.
  @Get()
  list(
    @Query('siteId') siteId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.wasteDisposalService.list({
      siteId,
      vendorId,
      from,
      to,
      page,
      pageSize,
    });
  }

  // Static path declared before the `:id` wildcard below — Nest matches
  // routes in declaration order (same reasoning as ExpensesController's
  // `summary`).
  @Get('summary')
  summary(
    @Query('siteId') siteId?: string,
    @Query('vendorId') vendorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.wasteDisposalService.summary({ siteId, vendorId, from, to });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wasteDisposalService.findOne(id);
  }

  // AD-9 exception (approved 2026-10-05): soft-delete, open to both roles —
  // the service itself enforces that a Site Engineer may only delete a
  // Waste Material entry they recorded (Owner/Admin can delete any).
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deleteMovementEntrySchema))
    body: DeleteMovementEntryInput,
  ) {
    return this.wasteDisposalService.remove(id, user, body.reason);
  }
}
