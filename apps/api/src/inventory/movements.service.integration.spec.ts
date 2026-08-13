import { BadRequestException, NotFoundException } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { MovementsService } from './movements.service';

// Real integration test against a live Postgres instance — this story's
// core risk is the stock-safety floor check under real concurrent writes
// (Dev Notes: updateMany + affected-row-count is the only race-safe way to
// enforce it without hand-rolled row locking), which a mock can't
// meaningfully exercise. Skips itself when no DATABASE_URL is configured.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('MovementsService (integration)', () => {
  let prisma: PrismaService;
  let service: MovementsService;
  let sourceSiteId: string;
  let destinationSiteId: string;
  let materialSizeId: string;
  let materialId: string;
  let categoryId: string;
  let unitId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new MovementsService(prisma);

    const source = await prisma.site.create({
      data: { name: 'Test Movement Source Site', location: 'Test Location' },
    });
    sourceSiteId = source.id;
    const destination = await prisma.site.create({
      data: {
        name: 'Test Movement Destination Site',
        location: 'Test Location',
      },
    });
    destinationSiteId = destination.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test Movement Category' },
    });
    categoryId = category.id;
    const unit = await prisma.unit.create({
      data: { name: 'Test Movement Unit' },
    });
    unitId = unit.id;
    const material = await prisma.material.create({
      data: {
        name: 'Test Movement Material',
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
    // Scoped by this file's own materialSizeId — GodownStock/SiteStock are
    // shared tables other integration spec files also write to (their own
    // materialSizeId), and an unscoped deleteMany({}) here would wipe
    // another still-running file's row under vitest's parallel workers.
    await prisma.movement.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
  });

  afterAll(async () => {
    await prisma.movement.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    await prisma.material.deleteMany({ where: { id: materialId } });
    await prisma.materialCategory.deleteMany({ where: { id: categoryId } });
    await prisma.unit.deleteMany({ where: { id: unitId } });
    await prisma.site.deleteMany({
      where: { id: { in: [sourceSiteId, destinationSiteId] } },
    });
    await prisma.onModuleDestroy();
  });

  it('a Movement decrements GodownStock by sentQuantity in the same transaction as the row insert', async () => {
    await prisma.godownStock.create({
      data: { materialSizeId, quantity: 100 },
    });

    const movement = await service.create({
      kind: 'GODOWN_TO_SITE',
      materialSizeId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    expect(movement.id).toBeDefined();
    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('70');
  });

  it('rejects a Movement that would take GodownStock below zero, without inserting the row (no orphan ledger entry)', async () => {
    await prisma.godownStock.create({ data: { materialSizeId, quantity: 10 } });

    await expect(
      service.create({
        kind: 'GODOWN_TO_SITE',
        materialSizeId,
        destinationSiteId,
        sentQuantity: 20,
        movedAt: '2026-08-13',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      await prisma.movement.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('10');
  });

  it('never oversells GodownStock under concurrent Movements against the same balance', async () => {
    await prisma.godownStock.create({
      data: { materialSizeId, quantity: 100 },
    });

    // 5 concurrent requests for 30 each = 150 requested against 100
    // available; only 3 can succeed (90 total) — proves updateMany's
    // affected-row-count check is atomic under real concurrent writers,
    // not just correct in single-threaded execution.
    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        service.create({
          kind: 'GODOWN_TO_SITE',
          materialSizeId,
          destinationSiteId,
          sentQuantity: 30,
          movedAt: '2026-08-13',
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(3);

    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('10');
    expect(
      await prisma.movement.findMany({ where: { materialSizeId } }),
    ).toHaveLength(3);
  });

  it('confirmReceipt increments SiteStock by receivedQuantity, leaving the sent/received gap visible', async () => {
    await prisma.godownStock.create({
      data: { materialSizeId, quantity: 100 },
    });
    const movement = await service.create({
      kind: 'GODOWN_TO_SITE',
      materialSizeId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    const updated = await service.confirmReceipt(movement.id, {
      receivedQuantity: 25,
    });

    expect(updated.receivedQuantity?.toString()).toBe('25');
    const stock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: destinationSiteId, materialSizeId },
      },
    });
    expect(stock?.quantity.toString()).toBe('25');
  });

  it('rejects confirming receipt twice for the same Movement', async () => {
    await prisma.godownStock.create({
      data: { materialSizeId, quantity: 100 },
    });
    const movement = await service.create({
      kind: 'GODOWN_TO_SITE',
      materialSizeId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });
    await service.confirmReceipt(movement.id, { receivedQuantity: 30 });

    await expect(
      service.confirmReceipt(movement.id, { receivedQuantity: 30 }),
    ).rejects.toThrow(BadRequestException);

    const stock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: destinationSiteId, materialSizeId },
      },
    });
    expect(stock?.quantity.toString()).toBe('30');
  });

  it('never double-counts SiteStock when confirmReceipt is called concurrently for the same Movement (review fix)', async () => {
    await prisma.godownStock.create({
      data: { materialSizeId, quantity: 100 },
    });
    const movement = await service.create({
      kind: 'GODOWN_TO_SITE',
      materialSizeId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    const results = await Promise.allSettled([
      service.confirmReceipt(movement.id, { receivedQuantity: 28 }),
      service.confirmReceipt(movement.id, { receivedQuantity: 30 }),
    ]);

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(1);

    const stock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: destinationSiteId, materialSizeId },
      },
    });
    const winner = (
      succeeded[0] as PromiseFulfilledResult<
        Awaited<ReturnType<typeof service.confirmReceipt>>
      >
    ).value;
    expect(stock?.quantity.toString()).toBe(
      winner.receivedQuantity?.toString(),
    );
  });

  it('throws NotFoundException confirming receipt for a Movement id that does not exist', async () => {
    await expect(
      service.confirmReceipt('00000000-0000-4000-8000-000000000000', {
        receivedQuantity: 10,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it("Story 5.4: a SITE_TO_SITE Movement decrements the source Site's SiteStock, never GodownStock", async () => {
    await prisma.siteStock.create({
      data: { siteId: sourceSiteId, materialSizeId, quantity: 100 },
    });

    const movement = await service.create({
      kind: 'SITE_TO_SITE',
      materialSizeId,
      sourceSiteId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    expect(movement.id).toBeDefined();
    const sourceStock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: sourceSiteId, materialSizeId },
      },
    });
    expect(sourceStock?.quantity.toString()).toBe('70');
    expect(
      await prisma.godownStock.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
  });

  it("Story 5.4: rejects a SITE_TO_SITE Movement that would take the source Site's SiteStock below zero, without inserting the row", async () => {
    await prisma.siteStock.create({
      data: { siteId: sourceSiteId, materialSizeId, quantity: 10 },
    });

    await expect(
      service.create({
        kind: 'SITE_TO_SITE',
        materialSizeId,
        sourceSiteId,
        destinationSiteId,
        sentQuantity: 20,
        movedAt: '2026-08-13',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      await prisma.movement.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
    const sourceStock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: sourceSiteId, materialSizeId },
      },
    });
    expect(sourceStock?.quantity.toString()).toBe('10');
  });

  it("Story 5.4: never oversells a source Site's SiteStock under concurrent SITE_TO_SITE Movements", async () => {
    await prisma.siteStock.create({
      data: { siteId: sourceSiteId, materialSizeId, quantity: 100 },
    });

    const results = await Promise.allSettled(
      Array.from({ length: 5 }, () =>
        service.create({
          kind: 'SITE_TO_SITE',
          materialSizeId,
          sourceSiteId,
          destinationSiteId,
          sentQuantity: 30,
          movedAt: '2026-08-13',
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    expect(succeeded).toHaveLength(3);

    const sourceStock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: sourceSiteId, materialSizeId },
      },
    });
    expect(sourceStock?.quantity.toString()).toBe('10');
  });

  it("Story 5.4: confirmReceipt on a SITE_TO_SITE Movement increments the destination Site's SiteStock, independent of the source Site's balance", async () => {
    await prisma.siteStock.create({
      data: { siteId: sourceSiteId, materialSizeId, quantity: 100 },
    });
    const movement = await service.create({
      kind: 'SITE_TO_SITE',
      materialSizeId,
      sourceSiteId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    await service.confirmReceipt(movement.id, { receivedQuantity: 28 });

    const destinationStock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: destinationSiteId, materialSizeId },
      },
    });
    expect(destinationStock?.quantity.toString()).toBe('28');
    const sourceStock = await prisma.siteStock.findUnique({
      where: {
        siteId_materialSizeId: { siteId: sourceSiteId, materialSizeId },
      },
    });
    expect(sourceStock?.quantity.toString()).toBe('70');
  });
});
