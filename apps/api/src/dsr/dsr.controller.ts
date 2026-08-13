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
  correctDsrSchema,
  createDsrSchema,
  type CorrectDsrInput,
  type CreateDsrInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { DsrService } from './dsr.service';

@Controller('dsr')
export class DsrController {
  constructor(private readonly dsrService: DsrService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDsrSchema))
  create(@Body() body: CreateDsrInput) {
    return this.dsrService.create(body);
  }

  @Post(':id/correct')
  @UsePipes(new ZodValidationPipe(correctDsrSchema))
  correct(@Param('id') id: string, @Body() body: CorrectDsrInput) {
    const { reason, ...input } = body;
    return this.dsrService.correct(id, input, reason);
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
