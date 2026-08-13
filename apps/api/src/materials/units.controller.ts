import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { createUnitSchema, type CreateUnitInput } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UnitsService } from './units.service';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUnitSchema))
  create(@Body() body: CreateUnitInput) {
    return this.unitsService.create(body);
  }

  @Get()
  list() {
    return this.unitsService.list();
  }
}
