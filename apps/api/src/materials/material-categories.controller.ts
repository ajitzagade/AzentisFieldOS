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
  createMaterialCategorySchema,
  updateMaterialCategorySchema,
  type CreateMaterialCategoryInput,
  type UpdateMaterialCategoryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MaterialCategoriesService } from './material-categories.service';

@Controller('material-categories')
export class MaterialCategoriesController {
  constructor(
    private readonly materialCategoriesService: MaterialCategoriesService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMaterialCategorySchema))
  create(@Body() body: CreateMaterialCategoryInput) {
    return this.materialCategoriesService.create(body);
  }

  @Get()
  list() {
    return this.materialCategoriesService.list();
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateMaterialCategorySchema))
  update(@Param('id') id: string, @Body() body: UpdateMaterialCategoryInput) {
    return this.materialCategoriesService.update(id, body);
  }
}
