import { BadRequestException } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ReturnWastageService } from './return-wastage.service';

// Real integration test against a live Postgres instance — this story's
// core risk is the stock-safety floor check under real concurrent writes,
// and that Task 1's schema fix (correctsId/reason) actually round-trips
// through Prisma. Skips itself when no DATABASE_URL is configured.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('ReturnWastageService (integration)', () => {
  let prisma: PrismaService;
  let service: ReturnWastageService;
  let siteId: string;
  let materialSizeId: string;
  let materialId: string;
  let categoryId: string;
  let unitId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new ReturnWastageService(prisma);

    const site = await prisma.site.create({
      data: { name: 'Test ReturnWastage Site', location: 'Test Location' },
    });
    siteId = site.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test ReturnWastage Category' },
    });
    categoryId = category.id;
    const unit = await prisma.unit.create({
      data: { name: 'Test ReturnWastage Unit' },
    });
    unitId = unit.id;
    const material = await prisma.material.create({
      data: {
        name: 'Test ReturnWastage Material',
        categoryId: category.id,
        unitId: unit.id,
      },
    });
    materialId = material.id;
    const materialSize = await prisma.materialSize.create({
      data: { materialId: material.id, label: 'Test Size' },
    });
    materialSizeId = materialSize.id;
  });

  afterEach(async () => {
    await prisma.returnWastage.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
  });

  afterAll(async () => {
    await prisma.returnWastage.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    await prisma.material.deleteMany({ where: { id: materialId } });
    await prisma.materialCategory.deleteMany({ where: { id: categoryId } });
    await prisma.unit.deleteMany({ where: { id: unitId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.onModuleDestroy();
  });

  it("a WASTAGE entry decreases the Site's SiteStock in the same transaction as the row insert", async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });

    const entry = await service.create({
      siteId,
      materialSizeId,
      kind: 'WASTAGE',
      quantity: 8,
      recordedAt: '2026-08-13',
    });

    expect(entry.id).toBeDefined();
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('92');
  });

  it("a RETURN entry also decreases the Site's SiteStock, not increases it", async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });

    await service.create({
      siteId,
      materialSizeId,
      kind: 'RETURN',
      quantity: 15,
      recordedAt: '2026-08-13',
    });

    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('85');
  });

  it('rejects an entry that would take SiteStock below zero, without inserting the row', async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 5 },
    });

    await expect(
      service.create({
        siteId,
        materialSizeId,
        kind: 'WASTAGE',
        quantity: 10,
        recordedAt: '2026-08-13',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      await prisma.returnWastage.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('5');
  });

  it('never oversells SiteStock under concurrent Return/Wastage entries', async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        service.create({
          siteId,
          materialSizeId,
          kind: 'WASTAGE',
          quantity: 30,
          recordedAt: '2026-08-13',
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(3);

    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('10');
  });

  it('Task 1: correctsId/reason round-trip through Prisma after the schema fix — a correction applies its signed delta and never mutates the original row (AD-9)', async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });
    const original = await service.create({
      siteId,
      materialSizeId,
      kind: 'WASTAGE',
      quantity: 8,
      recordedAt: '2026-08-13',
    });

    const correction = await service.create({
      siteId,
      materialSizeId,
      kind: 'WASTAGE',
      quantity: -3,
      recordedAt: '2026-08-13',
      correctsId: original.id,
      reason: 'Recount: 3 units less than originally recorded',
    });

    expect(correction.correctsId).toBe(original.id);
    expect(correction.reason).toBe(
      'Recount: 3 units less than originally recorded',
    );

    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('95');

    const unchangedOriginal = await prisma.returnWastage.findUnique({
      where: { id: original.id },
    });
    expect(unchangedOriginal?.quantity.toString()).toBe('8');
    expect(unchangedOriginal?.correctsId).toBeNull();
  });
});
