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
  createMaterialSchema,
  createMaterialSizeSchema,
  updateMaterialSchema,
  type CreateMaterialInput,
  type CreateMaterialSizeInput,
  type UpdateMaterialInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MaterialsService } from './materials.service';

@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createMaterialSchema))
  create(@Body() body: CreateMaterialInput) {
    return this.materialsService.create(body);
  }

  @Get()
  list() {
    return this.materialsService.list();
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateMaterialSchema))
  update(@Param('id') id: string, @Body() body: UpdateMaterialInput) {
    return this.materialsService.update(id, body);
  }

  @Post(':materialId/sizes')
  @UsePipes(new ZodValidationPipe(createMaterialSizeSchema))
  createSize(
    @Param('materialId') materialId: string,
    @Body() body: CreateMaterialSizeInput,
  ) {
    return this.materialsService.createSize(materialId, body);
  }

  @Get(':materialId/sizes')
  listSizes(@Param('materialId') materialId: string) {
    return this.materialsService.listSizes(materialId);
  }
}
