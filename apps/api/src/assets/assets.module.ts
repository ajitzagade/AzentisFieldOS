import { Module } from '@nestjs/common';
import { MachineryTypesController } from './machinery-types.controller';
import { MachineryTypesService } from './machinery-types.service';
import { VehicleTypesController } from './vehicle-types.controller';
import { VehicleTypesService } from './vehicle-types.service';
import { MachineryController } from './machinery.controller';
import { MachineryService } from './machinery.service';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  controllers: [
    MachineryTypesController,
    VehicleTypesController,
    MachineryController,
    VehicleController,
  ],
  providers: [
    MachineryTypesService,
    VehicleTypesService,
    MachineryService,
    VehicleService,
  ],
})
export class AssetsModule {}
