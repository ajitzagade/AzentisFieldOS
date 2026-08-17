import { Module } from '@nestjs/common';
import { MachineryTypesController } from './machinery-types.controller';
import { MachineryTypesService } from './machinery-types.service';
import { VehicleTypesController } from './vehicle-types.controller';
import { VehicleTypesService } from './vehicle-types.service';
import { MachineryController } from './machinery.controller';
import { MachineryService } from './machinery.service';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { AssetMovementsController } from './asset-movements.controller';
import { AssetMovementsService } from './asset-movements.service';
import { AssetServiceLogsController } from './asset-service-logs.controller';
import { AssetServiceLogsService } from './asset-service-logs.service';

@Module({
  controllers: [
    MachineryTypesController,
    VehicleTypesController,
    MachineryController,
    VehicleController,
    AssetMovementsController,
    AssetServiceLogsController,
  ],
  providers: [
    MachineryTypesService,
    VehicleTypesService,
    MachineryService,
    VehicleService,
    AssetMovementsService,
    AssetServiceLogsService,
  ],
})
export class AssetsModule {}
