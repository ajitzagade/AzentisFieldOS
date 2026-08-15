import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import {
  createEmploymentTypeSchema,
  type CreateEmploymentTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EmploymentTypesService } from './employment-types.service';

@Controller('employment-types')
export class EmploymentTypesController {
  constructor(
    private readonly employmentTypesService: EmploymentTypesService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createEmploymentTypeSchema))
  create(@Body() body: CreateEmploymentTypeInput) {
    return this.employmentTypesService.create(body);
  }

  @Get()
  list() {
    return this.employmentTypesService.list();
  }
}
