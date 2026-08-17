import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateMachineryTypeInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-15, NFR-4: Owner/Admin-configurable Machinery types. Create+list
// only — no disable/rename AC exists yet (Epic 14 owns the full admin
// lifecycle), same split as UnitsService.
@Injectable()
export class MachineryTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMachineryTypeInput) {
    try {
      return await this.prisma.machineryType.create({ data: input });
    } catch (error) {
      // MachineryType.name is @unique — a duplicate name must be a clean
      // 400, not a raw 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A Machinery Type with this name already exists',
        );
      }
      throw error;
    }
  }

  list() {
    return this.prisma.machineryType.findMany({ orderBy: { name: 'asc' } });
  }
}
