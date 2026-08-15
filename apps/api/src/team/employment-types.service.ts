import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateEmploymentTypeInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-19, NFR-4: Owner/Admin creates and maintains Employment Types —
// create+list only, Epic 14 owns the full admin lifecycle.
@Injectable()
export class EmploymentTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateEmploymentTypeInput) {
    try {
      return await this.prisma.employmentType.create({ data: input });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'An Employment Type with this name already exists',
        );
      }
      throw error;
    }
  }

  list() {
    return this.prisma.employmentType.findMany({ orderBy: { name: 'asc' } });
  }
}
