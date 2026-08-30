import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSiteInput, UpdateSiteInput } from '@azentisfieldos/shared';
import { Prisma, type SiteStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { getSiteActivityFeed } from './site-activity-feed';
import { getSitePhotoGallery } from './site-photo-gallery';

// FR-1: Owner/Admin creates and maintains Sites.
@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  create(input: CreateSiteInput) {
    return this.prisma.site.create({
      data: {
        name: input.name,
        location: input.location,
        status: input.status,
        contractReference: input.contractReference,
        description: input.description,
      },
    });
  }

  // FR-3: consolidated cross-Site rollup — a new Site is included with no
  // separate config step, so this is just "all Sites," ordered newest first.
  // The optional `status` filter lets Story 12.2's Dashboard rollup ask for
  // just ACTIVE Sites through this same query rather than re-querying `Site`
  // from DashboardService (each domain owns its own queries).
  list(status?: SiteStatus) {
    // Soft-deleted Sites are hidden from every list/picker (their rows and
    // history stay in the database).
    return this.prisma.site.findMany({
      where: { deletedAt: null, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Site master data uses a normal in-place update — it is not one of
  // AD-9's append-only transaction-history tables. Prisma's @updatedAt on
  // `updatedAt` timestamps this write automatically; no manual code needed.
  async update(id: string, input: UpdateSiteInput) {
    // A soft-deleted Site is inert: not readable, not editable (the 404
    // contract applies to writes too, or PATCH becomes a read/edit bypass).
    const existing = await this.prisma.site.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    try {
      return await this.prisma.site.update({ where: { id }, data: input });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Site ${id} not found`);
      }
      throw error;
    }
  }

  // Degrades gracefully as later epics ship — this reads from whatever
  // record types already exist for this Site, never requiring every
  // producer epic to be built first (every relation queried here already
  // exists in the schema today).
  async findOne(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }

    const feed = await getSiteActivityFeed(this.prisma, id);
    return { ...site, feed };
  }

  // FR-31: every photo from every DSR at this Site, newest-first.
  async getPhotos(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return getSitePhotoGallery(this.prisma, this.storage, id);
  }

  // Soft delete: stamps deletedAt so the Site vanishes from lists/pickers,
  // while the row — and every transaction pointing at it — stays in the
  // database. Never a hard DELETE (the ledger's foreign keys depend on it).
  // Idempotence: deleting an already-deleted Site 404s like any other read.
  async softDelete(id: string) {
    const site = await this.prisma.site.findUnique({ where: { id } });
    if (!site || site.deletedAt) {
      throw new NotFoundException(`Site ${id} not found`);
    }
    return this.prisma.site.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
