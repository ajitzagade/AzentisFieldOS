import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSiteInput, UpdateSiteInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getSiteActivityFeed } from './site-activity-feed';

// FR-1: Owner/Admin creates and maintains Sites.
@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateSiteInput) {
    return this.prisma.site.create({
      data: {
        name: input.name,
        location: input.location,
        status: input.status,
        contractReference: input.contractReference,
      },
    });
  }

  // FR-3: consolidated cross-Site rollup — a new Site is included with no
  // separate config step, so this is just "all Sites," ordered newest first.
  list() {
    return this.prisma.site.findMany({ orderBy: { createdAt: 'desc' } });
  }

  // Site master data uses a normal in-place update — it is not one of
  // AD-9's append-only transaction-history tables. Prisma's @updatedAt on
  // `updatedAt` timestamps this write automatically; no manual code needed.
  async update(id: string, input: UpdateSiteInput) {
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
    if (!site) {
      throw new NotFoundException(`Site ${id} not found`);
    }

    const feed = await getSiteActivityFeed(this.prisma, id);
    return { ...site, feed };
  }
}
