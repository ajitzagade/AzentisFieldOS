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
  createConsumptionSchema,
  deleteMovementEntrySchema,
  type CreateConsumptionInput,
  type DeleteMovementEntryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { ConsumptionService } from './consumption.service';

@Controller('consumption')
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  // The recording user comes from the session (CustomAuthGuard), the same
  // attribution rule the DSR controller follows — never from the body.
  @Post()
  @UsePipes(new ZodValidationPipe(createConsumptionSchema))
  create(@CurrentUser() user: AuthUser, @Body() body: CreateConsumptionInput) {
    return this.consumptionService.create(body, user.id);
  }

  // `page`/`pageSize` are opt-in (paginationParams) — omitted, this stays
  // the full, unfiltered list every existing caller relies on.
  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.consumptionService.list({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumptionService.findOne(id);
  }

  // AD-9 exception (approved 2026-10-05): soft-delete, open to both roles —
  // the service itself enforces that a Site Engineer may only delete a
  // Material Used entry they recorded (Owner/Admin can delete any).
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deleteMovementEntrySchema))
    body: DeleteMovementEntryInput,
  ) {
    return this.consumptionService.remove(id, user, body.reason);
  }
}
