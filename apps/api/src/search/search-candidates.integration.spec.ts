import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import type { PurchasesService } from '../inventory/purchases.service';

// search.service.spec.ts mocks every entity's searchCandidates() entirely,
// so the actual Prisma `where` clause (case-insensitive `contains`,
// deletedAt exclusion) is never exercised against a real database anywhere
// else. This test closes that gap for one representative entity (Vendor) —
// case-insensitivity and soft-delete filtering are implemented identically
// across all 9 searchable entities (same `contains`/`mode: 'insensitive'`/
// `deletedAt: null` shape), so one real exercise of the pattern is
// sufficient; it isn't a behavior unique to Vendor. Skips itself when no
// DATABASE_URL is configured (e.g. CI without a database service).
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('VendorsService.searchCandidates (integration)', () => {
  let prisma: PrismaService;
  let service: VendorsService;
  let activeVendorId: string;
  let deletedVendorId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    // searchCandidates() only touches `this.prisma` — PurchasesService is
    // never called by it, so an unused stub is sufficient here (same
    // minimal-dependency approach purchases.service.integration.spec.ts
    // uses for its own single-dependency construction).
    service = new VendorsService(
      prisma,
      undefined as unknown as PurchasesService,
    );

    const active = await prisma.vendor.create({
      data: { name: 'Zoctagon Trading Co' },
    });
    activeVendorId = active.id;

    const deleted = await prisma.vendor.create({
      data: { name: 'Zeta Deleted Supplies', deletedAt: new Date() },
    });
    deletedVendorId = deleted.id;
  });

  afterAll(async () => {
    await prisma.vendor.deleteMany({
      where: { id: { in: [activeVendorId, deletedVendorId] } },
    });
    await prisma.onModuleDestroy();
  });

  it('matches case-insensitively via a real `contains` query', async () => {
    const { candidates, total } = await service.searchCandidates('zoctagon');

    expect(total).toBe(1);
    expect(candidates.map((v) => v.id)).toContain(activeVendorId);
  });

  it('matches regardless of query casing against a mixed-case name', async () => {
    const { candidates } = await service.searchCandidates('TRADING');

    expect(candidates.map((v) => v.id)).toContain(activeVendorId);
  });

  it('excludes soft-deleted rows even when the query matches their name exactly', async () => {
    const { candidates, total } =
      await service.searchCandidates('Zeta Deleted');

    expect(total).toBe(0);
    expect(candidates.map((v) => v.id)).not.toContain(deletedVendorId);
  });
});
