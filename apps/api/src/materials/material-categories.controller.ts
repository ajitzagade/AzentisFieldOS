import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  createMaterialCategorySchema,
  updateMaterialCategorySchema,
  type CreateMaterialCategoryInput,
  type UpdateMaterialCategoryInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { MaterialCategoriesService } from './material-categories.service';

// FR-49: create + the rename/disable PATCH. Reads stay open; only the admin
// write (PATCH) is @Roles('OWNER_ADMIN').
@Controller('material-categories')
@UseGuards(RolesGuard)
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
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMaterialCategorySchema))
    body: UpdateMaterialCategoryInput,
  ) {
    return this.materialCategoriesService.update(id, body);
  }
}
