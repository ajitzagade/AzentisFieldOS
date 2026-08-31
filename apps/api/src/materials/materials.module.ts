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
  // Exported so SearchModule (Story 16.2) can reuse MaterialsService's own
  // query rather than re-querying Material from SearchService — same
  // precedent as SitesModule's exports: [SitesService].
  exports: [MaterialsService],
})
export class MaterialsModule {}
