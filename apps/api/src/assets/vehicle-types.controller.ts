import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import {
  createVehicleTypeSchema,
  type CreateVehicleTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { VehicleTypesService } from './vehicle-types.service';

@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createVehicleTypeSchema))
  create(@Body() body: CreateVehicleTypeInput) {
    return this.vehicleTypesService.create(body);
  }

  @Get()
  list() {
    return this.vehicleTypesService.list();
  }
}
