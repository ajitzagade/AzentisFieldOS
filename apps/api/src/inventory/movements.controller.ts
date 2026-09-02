import {
  Body,
  Controller,
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
  type ConfirmMovementReceiptInput,
  type CreateMovementInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMovementSchema))
  create(@Body() body: CreateMovementInput) {
    return this.movementsService.create(body);
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
}
