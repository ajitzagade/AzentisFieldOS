import { BadRequestException } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { PurchasesService } from './purchases.service';

// Real integration test against a live Postgres instance — this story's
// core risk is the transactional GodownStock/SiteStock upsert (a Purchase
// row must never be inserted without its balance update, and vice versa),
// which a mock can't meaningfully exercise. Skips itself when no
// DATABASE_URL is configured (e.g. CI without a database service).
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('PurchasesService (integration)', () => {
  let prisma: PrismaService;
  let service: PurchasesService;
  let siteId: string;
  let materialSizeId: string;
  let materialId: string;
  let categoryId: string;
  let unitId: string;
  let vendorId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    service = new PurchasesService(prisma);

    const site = await prisma.site.create({
      data: { name: 'Test Purchase Site', location: 'Test Location' },
    });
    siteId = site.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test Purchase Category' },
    });
    categoryId = category.id;
    const unit = await prisma.unit.create({
      data: { name: 'Test Purchase Unit' },
    });
    unitId = unit.id;
    const material = await prisma.material.create({
      data: {
        name: 'Test Purchase Material',
        categoryId: category.id,
        unitId: unit.id,
      },
    });
    materialId = material.id;
    const materialSize = await prisma.materialSize.create({
      data: { materialId: material.id, label: 'Test Size' },
    });
    materialSizeId = materialSize.id;

    const vendor = await prisma.vendor.create({
      data: { name: 'Test Purchase Vendor' },
    });
    vendorId = vendor.id;
  });

  afterEach(async () => {
    // Scoped by this file's own materialSizeId — GodownStock/SiteStock are
    // shared tables other integration spec files also write to (their own
    // materialSizeId), and an unscoped deleteMany({}) here would wipe
    // another still-running file's row under vitest's parallel workers.
    await prisma.purchase.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
  });

  afterAll(async () => {
    await prisma.purchase.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    await prisma.material.deleteMany({ where: { id: materialId } });
    await prisma.materialCategory.deleteMany({ where: { id: categoryId } });
    await prisma.unit.deleteMany({ where: { id: unitId } });
    await prisma.vendor.deleteMany({ where: { id: vendorId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.onModuleDestroy();
  });

  it('a GODOWN-destined Purchase creates the row and increases GodownStock in the same transaction', async () => {
    const purchase = await service.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: 100,
      rate: 50,
      totalAmount: 5000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
    });

    expect(purchase.id).toBeDefined();
    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('100');
    expect(
      await prisma.siteStock.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
  });

  it("a SITE-destined Purchase (Story 5.3's direct Vendor->Site flow, FR-10) persists receiverName and increases that Site's SiteStock and never touches GodownStock", async () => {
    const purchase = await service.create({
      vendorId,
      materialSizeId,
      destination: 'SITE',
      siteId,
      quantity: 40,
      rate: 50,
      totalAmount: 2000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
      receiverName: 'Site Foreman Rajesh',
    });

    expect(purchase.receiverName).toBe('Site Foreman Rajesh');
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    expect(stock?.quantity.toString()).toBe('40');
    expect(
      await prisma.godownStock.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
  });

  it('a second Purchase for the same Material Size increments the existing balance rather than overwriting it', async () => {
    await service.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: 100,
      rate: 50,
      totalAmount: 5000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
    });
    await service.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: 30,
      rate: 50,
      totalAmount: 1500,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
    });

    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('130');
    expect(
      await prisma.purchase.findMany({ where: { materialSizeId } }),
    ).toHaveLength(2);
  });

  it('a correction applies its signed delta on top of the running balance and never mutates the original row (AD-9)', async () => {
    const original = await service.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: 100,
      rate: 50,
      totalAmount: 5000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
    });

    await service.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: -20,
      rate: 50,
      totalAmount: 1000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
      correctsId: original.id,
      reason: 'Recount: 20 Bags short of original delivery',
    });

    const stock = await prisma.godownStock.findUnique({
      where: { materialSizeId },
    });
    expect(stock?.quantity.toString()).toBe('80');

    const unchangedOriginal = await prisma.purchase.findUnique({
      where: { id: original.id },
    });
    expect(unchangedOriginal?.quantity.toString()).toBe('100');
    expect(
      await prisma.purchase.findMany({ where: { materialSizeId } }),
    ).toHaveLength(2);
  });

  it('rejects a correctsId that does not reference an existing Purchase, without writing anything', async () => {
    await expect(
      service.create({
        vendorId,
        materialSizeId,
        destination: 'GODOWN',
        quantity: -20,
        rate: 50,
        totalAmount: 1000,
        paymentStatus: 'PAID',
        purchasedAt: '2026-08-13',
        correctsId: '00000000-0000-4000-8000-000000000000',
        reason: 'Recount',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      await prisma.purchase.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
    expect(
      await prisma.godownStock.findMany({ where: { materialSizeId } }),
    ).toHaveLength(0);
  });

  it('rejects a Purchase referencing a Vendor that does not exist, as a 400 not a 500', async () => {
    await expect(
      service.create({
        vendorId: '00000000-0000-4000-8000-000000000000',
        materialSizeId,
        destination: 'GODOWN',
        quantity: 10,
        rate: 50,
        totalAmount: 500,
        paymentStatus: 'PAID',
        purchasedAt: '2026-08-13',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
