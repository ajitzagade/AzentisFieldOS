import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateMaterialInput,
  CreateMaterialSizeInput,
  UpdateMaterialInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-4: Owner/Admin creates and maintains Materials within a Category,
// each tied to a Unit of Measure.
@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMaterialInput) {
    try {
      const material = await this.prisma.material.create({ data: input });
      return this.normalizeCustomFields(material);
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Category name, Unit name, and Sizes in one request — the list page
  // (story 4.1 Task 4) needs all three for its table without a second
  // round-trip per row.
  async list() {
    const materials = await this.prisma.material.findMany({
      include: { category: true, unit: true, sizes: true },
      orderBy: { name: 'asc' },
    });
    return materials.map((material) => this.normalizeCustomFields(material));
  }

  // Disabling/renaming is a normal in-place update — Material is master
  // data, not one of AD-9's append-only transaction-history tables.
  // Custom Fields (FR-7, story 4.3) are edited via this same PATCH — there
  // is no independent lifecycle/endpoint for a Custom Field.
  async update(id: string, input: UpdateMaterialInput) {
    try {
      const material = await this.prisma.material.update({
        where: { id },
        data: input,
      });
      return this.normalizeCustomFields(material);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Material ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // Story 4.3: Material.customFields Json @default("{}") predates this
  // story's decision that the shape should be an array — changing the
  // Postgres-level default would need a migration touching every existing
  // row for a default that's only ever read, never compared. Normalizing
  // {} -> [] here neutralizes the mismatch for every API consumer without
  // one. Do not "fix" the Prisma default instead.
  private normalizeCustomFields<T extends { customFields: unknown }>(
    material: T,
  ): T {
    return {
      ...material,
      customFields: Array.isArray(material.customFields)
        ? material.customFields
        : [],
    };
  }

  // Story 16.2's global search: an unranked candidate set of active
  // Materials matching by name (ranking happens once, in SearchService,
  // shared across every searchable entity). Category is included because
  // Material only has @@unique([categoryId, name]) — the same name can
  // exist in two different Categories, so Category disambiguates two
  // otherwise-identical-looking results. Capped at 200 candidates, same
  // safety-valve reasoning as SitesService.searchCandidates.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.MaterialGetPayload<{ include: { category: true } }>[];
    total: number;
  }> {
    const where: Prisma.MaterialWhereInput = {
      isActive: true,
      name: { contains: q, mode: 'insensitive' },
    };
    const [candidates, total] = await Promise.all([
      this.prisma.material.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        take: 200,
      }),
      this.prisma.material.count({ where }),
    ]);
    return { candidates, total };
  }

  // Story 14.3 (AC #3): the Settings "Low-stock Thresholds" summary card — every
  // active Material that has a threshold configured (FR-36 nullable: no threshold
  // means never flagged). Read-only discovery surface; editing the threshold
  // itself stays on the Material's own edit page (Epic 4/5), not rebuilt here.
  async listThresholds() {
    const materials = await this.prisma.material.findMany({
      where: { isActive: true, lowStockThreshold: { not: null } },
      select: {
        id: true,
        name: true,
        lowStockThreshold: true,
        unit: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
    return materials.map((material) => ({
      id: material.id,
      name: material.name,
      lowStockThreshold: material.lowStockThreshold,
      unit: material.unit.name,
    }));
  }

  // FR-5: Sizes are purely additive — no update/delete path exists
  // (AC #2), mirroring AD-9's append-only discipline for a different but
  // compatible reason (a Size that could silently change/disappear would
  // corrupt every Stock/Purchase/Movement row keyed off materialSizeId).
  async createSize(materialId: string, input: CreateMaterialSizeInput) {
    try {
      return await this.prisma.materialSize.create({
        data: { materialId, label: input.label },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This Size already exists for this Material',
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(`Material ${materialId} does not exist`);
      }
      throw error;
    }
  }

  listSizes(materialId: string) {
    return this.prisma.materialSize.findMany({
      where: { materialId },
      orderBy: { label: 'asc' },
    });
  }

  // AC #5: creating/updating a Material with a categoryId/unitId that
  // doesn't exist must be a 400, not a raw 500 — same pattern as
  // SitesService.update's P2025 -> NotFoundException translation.
  // Material also has @@unique([categoryId, name]) — a duplicate name
  // within the same Category must be a clean 400 too, not a raw 500.
  private translateWriteError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new BadRequestException(
          'This Material references a Category or Unit that does not exist',
        );
      }
      if (error.code === 'P2002') {
        return new BadRequestException(
          'A Material with this name already exists in this Category',
        );
      }
    }
    return error;
  }
}
