import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateUnitInput, UpdateUnitInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-6: Owner/Admin defines Units of Measure. FR-49 adds the rename/disable
// lifecycle every other lookup type already has.
@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUnitInput) {
    try {
      return await this.prisma.unit.create({ data: input });
    } catch (error) {
      throw this.translateDuplicateNameError(error);
    }
  }

  list() {
    return this.prisma.unit.findMany({ orderBy: { name: 'asc' } });
  }

  // Rename/disable is a normal in-place update — Unit is master data, not
  // one of AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateUnitInput) {
    try {
      return await this.prisma.unit.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Unit ${id} not found`);
      }
      throw this.translateDuplicateNameError(error);
    }
  }

  // Unit.name is @unique — a duplicate name must be a clean 400, not a raw
  // 500.
  private translateDuplicateNameError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new BadRequestException('A Unit with this name already exists');
    }
    return error;
  }
}
