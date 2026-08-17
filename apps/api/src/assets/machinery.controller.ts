import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
  list() {
    return this.machineryService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machineryService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateMachinerySchema))
  update(@Param('id') id: string, @Body() body: UpdateMachineryInput) {
    return this.machineryService.update(id, body);
  }
}
