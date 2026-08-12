import { Injectable } from '@nestjs/common';
import type { CreateSiteInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

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
}
