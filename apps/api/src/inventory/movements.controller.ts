import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  confirmMovementReceiptSchema,
  createMovementSchema,
  deleteMovementEntrySchema,
  type ConfirmMovementReceiptInput,
  type CreateMovementInput,
  type DeleteMovementEntryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMovementSchema))
  create(@CurrentUser() user: AuthUser, @Body() body: CreateMovementInput) {
    return this.movementsService.create(body, user.id);
  }

  @Patch(':id/confirm-receipt')
  confirmReceipt(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(confirmMovementReceiptSchema))
    body: ConfirmMovementReceiptInput,
  ) {
    return this.movementsService.confirmReceipt(id, body);
  }

  // `page`/`pageSize` are opt-in (paginationParams) — omitted, this stays
  // the full, unfiltered list every existing caller relies on.
  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.movementsService.list({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }

  // AD-9 exception (approved 2026-10-05): soft-delete, open to both roles —
  // the service itself enforces that a Site Engineer may only delete a
  // Movement they recorded (Owner/Admin can delete any).
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(deleteMovementEntrySchema))
    body: DeleteMovementEntryInput,
  ) {
    return this.movementsService.remove(id, user, body.reason);
  }
}
