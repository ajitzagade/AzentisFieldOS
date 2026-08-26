import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateVehicleTypeInput,
  UpdateVehicleTypeInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-16, NFR-4: Owner/Admin-configurable Vehicle types. Story 14.3 (FR-49)
// adds the rename/disable lifecycle Story 8.1 deferred to Epic 14.
@Injectable()
export class VehicleTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVehicleTypeInput) {
    try {
      return await this.prisma.vehicleType.create({ data: input });
    } catch (error) {
      throw this.translateDuplicateNameError(error);
    }
  }

  list() {
    return this.prisma.vehicleType.findMany({ orderBy: { name: 'asc' } });
  }

  // Story 14.3: rename/disable is a normal in-place update — Vehicle Type is
  // master data, not one of AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateVehicleTypeInput) {
    try {
      return await this.prisma.vehicleType.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Vehicle Type ${id} not found`);
      }
      throw this.translateDuplicateNameError(error);
    }
  }

  // VehicleType.name is @unique — a duplicate name must be a clean 400,
  // not a raw 500.
  private translateDuplicateNameError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new BadRequestException(
        'A Vehicle Type with this name already exists',
      );
    }
    return error;
  }
}
