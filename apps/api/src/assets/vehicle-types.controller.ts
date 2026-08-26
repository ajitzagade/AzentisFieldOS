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
  createVehicleTypeSchema,
  updateVehicleTypeSchema,
  type CreateVehicleTypeInput,
  type UpdateVehicleTypeInput,
} from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { VehicleTypesService } from './vehicle-types.service';

// Story 14.3 (FR-49): create + the new rename/disable PATCH. Reads stay open;
// only the admin write (PATCH) is @Roles('OWNER_ADMIN').
@Controller('vehicle-types')
@UseGuards(RolesGuard)
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

  @Patch(':id')
  @Roles('OWNER_ADMIN')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateVehicleTypeSchema))
    body: UpdateVehicleTypeInput,
  ) {
    return this.vehicleTypesService.update(id, body);
  }
}
