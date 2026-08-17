import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateVehicleTypeInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-16, NFR-4: Owner/Admin-configurable Vehicle types. Create+list only
// — no disable/rename AC exists yet (Epic 14 owns the full admin
// lifecycle), same split as MachineryTypesService.
@Injectable()
export class VehicleTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateVehicleTypeInput) {
    try {
      return await this.prisma.vehicleType.create({ data: input });
    } catch (error) {
      // VehicleType.name is @unique — a duplicate name must be a clean
      // 400, not a raw 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A Vehicle Type with this name already exists',
        );
      }
      throw error;
    }
  }

  list() {
    return this.prisma.vehicleType.findMany({ orderBy: { name: 'asc' } });
  }
}
