import { Injectable } from '@nestjs/common';
import type { UpdateBrandingConfigInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

// Story 14.1 (FR-47): the admin read/write path for the single BrandingConfig
// row Story 13.1 seeded. There is NO "publish" concept — `update` is a plain
// in-place `prisma.brandingConfig.update()` against the one existing row, and
// ReportCompilerService (Story 13.1) already reads the current row fresh on
// every compile (`brandingConfig.findFirst()` inside `getBrandingSnapshot`), so
// AC #1's "the change reflects in the next generated report automatically, with
// no separate publish step" is satisfied simply by there being nothing else to
// build — no draft/published versioning, no cache to invalidate.
//
// BrandingConfig is a singleton (Story 13.1): exactly one row, seeded at deploy
// time. `getConfig` returns it; if a fresh DB was never seeded it creates the
// default row on first read so the admin UI always has something to edit —
// idempotent, never a second row.
@Injectable()
export class BrandingConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    const existing = await this.prisma.brandingConfig.findFirst();
    if (existing) return existing;
    return this.prisma.brandingConfig.create({
      data: { tenantName: 'Your Company' },
    });
  }

  async update(input: UpdateBrandingConfigInput) {
    const config = await this.getConfig();
    return this.prisma.brandingConfig.update({
      where: { id: config.id },
      data: input,
    });
  }
}
