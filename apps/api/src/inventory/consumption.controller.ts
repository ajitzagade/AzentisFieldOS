import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import {
  createConsumptionSchema,
  type CreateConsumptionInput,
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
}
