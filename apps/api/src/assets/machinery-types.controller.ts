import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import {
  createMachineryTypeSchema,
  type CreateMachineryTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MachineryTypesService } from './machinery-types.service';

@Controller('machinery-types')
export class MachineryTypesController {
  constructor(private readonly machineryTypesService: MachineryTypesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMachineryTypeSchema))
  create(@Body() body: CreateMachineryTypeInput) {
    return this.machineryTypesService.create(body);
  }

  @Get()
  list() {
    return this.machineryTypesService.list();
  }
}
