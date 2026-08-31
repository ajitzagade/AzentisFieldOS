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
  createMachinerySchema,
  updateMachinerySchema,
  type CreateMachineryInput,
  type UpdateMachineryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MachineryService } from './machinery.service';

@Controller('machinery')
export class MachineryController {
  constructor(private readonly machineryService: MachineryService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMachinerySchema))
  create(@Body() body: CreateMachineryInput) {
    return this.machineryService.create(body);
  }

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('order') order?: string,
  ) {
    return this.machineryService.list({ q, page, pageSize, sort, order });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machineryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMachinerySchema))
    body: UpdateMachineryInput,
  ) {
    return this.machineryService.update(id, body);
  }
}
