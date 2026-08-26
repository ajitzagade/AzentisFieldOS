import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateEmploymentTypeInput,
  UpdateEmploymentTypeInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-19, NFR-4: Owner/Admin creates and maintains Employment Types. Story 14.3
// (FR-49) adds the rename/disable lifecycle Story 6.1 deferred to Epic 14.
@Injectable()
export class EmploymentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEmploymentTypeInput) {
    try {
      return await this.prisma.employmentType.create({ data: input });
    } catch (error) {
      throw this.translateDuplicateNameError(error);
    }
  }

  list() {
    return this.prisma.employmentType.findMany({ orderBy: { name: 'asc' } });
  }

  // Story 14.3: rename/disable is a normal in-place update — Employment Type is
  // master data, not one of AD-9's append-only transaction-history tables.
  async update(id: string, input: UpdateEmploymentTypeInput) {
    try {
      return await this.prisma.employmentType.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Employment Type ${id} not found`);
      }
      throw this.translateDuplicateNameError(error);
    }
  }

  private translateDuplicateNameError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new BadRequestException(
        'An Employment Type with this name already exists',
      );
    }
    return error;
  }
}
