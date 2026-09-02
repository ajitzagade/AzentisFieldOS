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
  createReturnWastageSchema,
  type CreateReturnWastageInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReturnWastageService } from './return-wastage.service';

@Controller('return-wastage')
export class ReturnWastageController {
  constructor(private readonly returnWastageService: ReturnWastageService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReturnWastageSchema))
  create(@Body() body: CreateReturnWastageInput) {
    return this.returnWastageService.create(body);
  }

  // `page`/`pageSize` are opt-in (paginationParams) — omitted, this stays
  // the full, unfiltered list every existing caller relies on.
  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.returnWastageService.list({ page, pageSize });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnWastageService.findOne(id);
  }
}
