import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateMaterialCategoryInput,
  UpdateMaterialCategoryInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-4: Owner/Admin creates and maintains Material Categories.
@Injectable()
export class MaterialCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMaterialCategoryInput) {
    try {
      return await this.prisma.materialCategory.create({ data: input });
    } catch (error) {
      throw this.translateDuplicateNameError(error);
    }
  }

  list() {
    return this.prisma.materialCategory.findMany({ orderBy: { name: 'asc' } });
  }

  // Disabling is a normal in-place update, not one of AD-9's append-only
  // transaction-history tables — Category is master data (EXPERIENCE.md's
  // Edit-vs-Correct distinction).
  async update(id: string, input: UpdateMaterialCategoryInput) {
    try {
      return await this.prisma.materialCategory.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Material Category ${id} not found`);
      }
      throw this.translateDuplicateNameError(error);
    }
  }

  // MaterialCategory.name is @unique — a duplicate name must be a clean
  // 400, not a raw 500 (same pattern as MaterialsService.createSize's
  // P2002 -> BadRequestException translation).
  private translateDuplicateNameError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new BadRequestException(
        'A Material Category with this name already exists',
      );
    }
    return error;
  }
}
