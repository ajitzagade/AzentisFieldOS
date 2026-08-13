import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
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

  @Get()
  list() {
    return this.returnWastageService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.returnWastageService.findOne(id);
  }
}
