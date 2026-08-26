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

  // Story 14.3 (AC #3): read-only Low-stock Thresholds summary for the Settings
  // discoverability hub. Static path — no `:id` GET exists on this controller,
  // so it cannot be shadowed by a wildcard.
  @Get('thresholds')
  listThresholds() {
    return this.materialsService.listThresholds();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMaterialSchema))
    body: UpdateMaterialInput,
  ) {
    return this.materialsService.update(id, body);
  }

  @Post(':materialId/sizes')
  createSize(
    @Param('materialId') materialId: string,
    @Body(new ZodValidationPipe(createMaterialSizeSchema))
    body: CreateMaterialSizeInput,
  ) {
    return this.materialsService.createSize(materialId, body);
  }

  @Get(':materialId/sizes')
  listSizes(@Param('materialId') materialId: string) {
    return this.materialsService.listSizes(materialId);
  }
}
