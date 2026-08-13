import { Module } from '@nestjs/common';
import { MaterialCategoriesController } from './material-categories.controller';
import { MaterialCategoriesService } from './material-categories.service';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';

@Module({
  controllers: [
    MaterialCategoriesController,
    UnitsController,
    MaterialsController,
  ],
  providers: [MaterialCategoriesService, UnitsService, MaterialsService],
})
export class MaterialsModule {}
