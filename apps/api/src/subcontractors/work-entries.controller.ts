import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import {
  createSubcontractorWorkEntrySchema,
  type CreateSubcontractorWorkEntryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { WorkEntriesService } from './work-entries.service';

// No @Roles() anywhere on this controller — Site Supervisor or Owner/Admin
// may both record and correct Work Entries (FR-58, AC #6), the one
// Supervisor-facing write surface in Epic 18.
@Controller('subcontractor-work-entries')
export class WorkEntriesController {
  constructor(private readonly workEntriesService: WorkEntriesService) {}

  // The recording user comes from the session (CustomAuthGuard), same
  // attribution rule as WasteDisposal/Consumption/DSR — never from the body.
  @Post()
  @UsePipes(new ZodValidationPipe(createSubcontractorWorkEntrySchema))
  create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateSubcontractorWorkEntryInput,
  ) {
    return this.workEntriesService.create(body, user.id);
  }

  @Get()
  list(@Query('siteContractId') siteContractId?: string) {
    return this.workEntriesService.list({ siteContractId });
  }
}
