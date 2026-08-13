import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateUnitInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-6: Owner/Admin defines Units of Measure. Create+list only — no
// disable/rename AC exists for Unit (see story 4.1 Dev Notes).
@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUnitInput) {
    try {
      return await this.prisma.unit.create({ data: input });
    } catch (error) {
      // Unit.name is @unique — a duplicate name must be a clean 400, not
      // a raw 500.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('A Unit with this name already exists');
      }
      throw error;
    }
  }

  list() {
    return this.prisma.unit.findMany({ orderBy: { name: 'asc' } });
  }
}
