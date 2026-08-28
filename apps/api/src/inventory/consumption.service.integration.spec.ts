import { BadRequestException } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumptionService } from './consumption.service';

// Real integration test against a live Postgres instance — this story's
// core risk is the stock-safety floor check under real concurrent writes,
// which a mock can't meaningfully exercise. Skips itself when no
// DATABASE_URL is configured.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('ConsumptionService (integration)', () => {
  let prisma: PrismaService;
  let service: ConsumptionService;
  let siteId: string;
  let materialSizeId: string;
  let materialId: string;
  let categoryId: string;
  let unitId: string;
  let userId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new ConsumptionService(prisma);

    const site = await prisma.site.create({
      data: { name: 'Test Consumption Site', location: 'Test Location' },
    });
    siteId = site.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test Consumption Category' },
    });
    categoryId = category.id;
    const unit = await prisma.unit.create({
      data: { name: 'Test Consumption Unit' },
    });
    unitId = unit.id;
    const material = await prisma.material.create({
      data: {
        name: 'Test Consumption Material',
        categoryId: category.id,
        unitId: unit.id,
      },
    });
    materialId = material.id;
    const materialSize = await prisma.materialSize.create({
      data: { materialId: material.id, label: 'Test Size' },
    });
    materialSizeId = materialSize.id;

    const user = await prisma.user.create({
      data: {
        clerkId: 'test-consumption-user',
        email: 'test-consumption-user@internal.local',
        name: 'Test Consumption User',
        role: 'OWNER_ADMIN',
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.consumption.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
  });

  afterAll(async () => {
    await prisma.consumption.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    await prisma.material.deleteMany({ where: { id: materialId } });
    await prisma.materialCategory.deleteMany({ where: { id: categoryId } });
    await prisma.unit.deleteMany({ where: { id: unitId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  it("a Consumption decreases the Site's SiteStock in the same transaction as the row insert", async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });

    const consumption = await service.create(
      {
        siteId,
        materialSizeId,
        quantity: 10,
        consumedAt: '2026-08-13',
      },
      userId,
    );

    expect(consumption.id).toBeDefined();
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('90');
  });

  it("rejects a Consumption that would take the Site's SiteStock below zero, without inserting the row", async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 5 },
    });

    await expect(
      service.create(
        {
          siteId,
          materialSizeId,
          quantity: 10,
          consumedAt: '2026-08-13',
        },
        userId,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(
      await prisma.consumption.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('5');
  });

  it("never oversells the Site's SiteStock under concurrent Consumption entries", async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        service.create(
          {
            siteId,
            materialSizeId,
            quantity: 30,
            consumedAt: '2026-08-13',
          },
          userId,
        ),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(3);

    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('10');
  });

  it('a correction applies its signed delta and never mutates the original row (AD-9)', async () => {
    await prisma.siteStock.create({
      data: { siteId, materialSizeId, quantity: 100 },
    });
    const original = await service.create(
      {
        siteId,
        materialSizeId,
        quantity: 10,
        consumedAt: '2026-08-13',
      },
      userId,
    );

    await service.create(
      {
        siteId,
        materialSizeId,
        quantity: -4,
        consumedAt: '2026-08-13',
        correctsId: original.id,
        reason: 'Recount: 4 units less than originally recorded',
      },
      userId,
    );

    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('94');

    const unchangedOriginal = await prisma.consumption.findUnique({
      where: { id: original.id },
    });
    expect(unchangedOriginal?.quantity.toString()).toBe('10');
  });
});
