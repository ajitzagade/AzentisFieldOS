import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { PurchasesService } from './purchases.service';
import { MovementsService } from './movements.service';
import { ConsumptionService } from './consumption.service';
import { ReturnWastageService } from './return-wastage.service';
import { StockService } from './stock.service';

// FR-14: proves GodownStock/SiteStock always reconcile exactly to the sum
// of transaction history — never a manually-editable field. Exercises the
// real write paths from Stories 5.1-5.6 against a live Postgres instance,
// then independently re-sums the ledger tables and compares against the
// materialized balance, rather than just hand-computing an expected number.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('Stock reconciliation (integration)', () => {
  let prisma: PrismaService;
  let purchases: PurchasesService;
  let movements: MovementsService;
  let consumption: ConsumptionService;
  let returnWastage: ReturnWastageService;
  let stock: StockService;

  let vendorId: string;
  let destinationSiteId: string;
  let materialSizeId: string;
  let materialId: string;
  let categoryId: string;
  let unitId: string;
  let userId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    purchases = new PurchasesService(prisma);
    movements = new MovementsService(prisma);
    consumption = new ConsumptionService(prisma);
    returnWastage = new ReturnWastageService(prisma);
    stock = new StockService(prisma);

    const vendor = await prisma.vendor.create({
      data: { name: 'Test Reconciliation Vendor' },
    });
    vendorId = vendor.id;
    const destination = await prisma.site.create({
      data: { name: 'Test Reconciliation Site', location: 'Test Location' },
    });
    destinationSiteId = destination.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test Reconciliation Category' },
    });
    categoryId = category.id;
    const unit = await prisma.unit.create({
      data: { name: 'Test Reconciliation Unit' },
    });
    unitId = unit.id;
    const material = await prisma.material.create({
      data: {
        name: 'Test Reconciliation Material',
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
        email: 'test-reconciliation-user@internal.local',
        name: 'Test Reconciliation User',
        passwordHash: 'test-hash',
        role: 'OWNER_ADMIN',
      },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await prisma.returnWastage.deleteMany({ where: { materialSizeId } });
    await prisma.consumption.deleteMany({ where: { materialSizeId } });
    await prisma.movement.deleteMany({ where: { materialSizeId } });
    await prisma.purchase.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
  });

  afterAll(async () => {
    await prisma.returnWastage.deleteMany({ where: { materialSizeId } });
    await prisma.consumption.deleteMany({ where: { materialSizeId } });
    await prisma.movement.deleteMany({ where: { materialSizeId } });
    await prisma.purchase.deleteMany({ where: { materialSizeId } });
    await prisma.godownStock.deleteMany({ where: { materialSizeId } });
    await prisma.siteStock.deleteMany({ where: { materialSizeId } });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    await prisma.material.deleteMany({ where: { id: materialId } });
    await prisma.materialCategory.deleteMany({ where: { id: categoryId } });
    await prisma.unit.deleteMany({ where: { id: unitId } });
    await prisma.site.deleteMany({ where: { id: destinationSiteId } });
    await prisma.vendor.deleteMany({ where: { id: vendorId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.onModuleDestroy();
  });

  it('GodownStock and SiteStock always reconcile exactly to the sum of every applicable transaction row', async () => {
    // Godown: +100 (Purchase), -30 (Movement sent) => 70
    await purchases.create({
      vendorId,
      materialSizeId,
      destination: 'GODOWN',
      quantity: 100,
      rate: 50,
      totalAmount: 5000,
      paymentStatus: 'PAID',
      purchasedAt: '2026-08-13',
    });
    const movement = await movements.create({
      kind: 'GODOWN_TO_SITE',
      materialSizeId,
      destinationSiteId,
      sentQuantity: 30,
      movedAt: '2026-08-13',
    });

    // Site: +28 (Movement received), -10 (Consumption), -3 (Wastage) => 15
    await movements.confirmReceipt(movement.id, { receivedQuantity: 28 });
    await consumption.create(
      {
        siteId: destinationSiteId,
        materialSizeId,
        quantity: 10,
        consumedAt: '2026-08-13',
      },
      userId,
    );
    await returnWastage.create({
      siteId: destinationSiteId,
      materialSizeId,
      kind: 'WASTAGE',
      quantity: 3,
      recordedAt: '2026-08-13',
    });

    // Independently re-sum the ledger tables — not just re-reading the
    // materialized balance, which would be circular.
    const [purchaseSum, sentSum, receivedSum, consumptionSum, wastageSum] =
      await Promise.all([
        prisma.purchase.aggregate({
          where: { materialSizeId, destination: 'GODOWN' },
          _sum: { quantity: true },
        }),
        prisma.movement.aggregate({
          where: { materialSizeId, kind: 'GODOWN_TO_SITE' },
          _sum: { sentQuantity: true },
        }),
        prisma.movement.aggregate({
          where: { materialSizeId, kind: 'GODOWN_TO_SITE' },
          _sum: { receivedQuantity: true },
        }),
        prisma.consumption.aggregate({
          where: { materialSizeId },
          _sum: { quantity: true },
        }),
        prisma.returnWastage.aggregate({
          where: { materialSizeId },
          _sum: { quantity: true },
        }),
      ]);

    const expectedGodown =
      Number(purchaseSum._sum.quantity) - Number(sentSum._sum.sentQuantity);
    const expectedSite =
      Number(receivedSum._sum.receivedQuantity) -
      Number(consumptionSum._sum.quantity) -
      Number(wastageSum._sum.quantity);

    const godownRows = await stock.getGodownStock();
    const siteRows = await stock.getSiteStock(destinationSiteId);

    expect(
      Number(
        godownRows.find((r) => r.materialSizeId === materialSizeId)?.quantity,
      ),
    ).toBe(expectedGodown);
    expect(
      Number(
        siteRows.find((r) => r.materialSizeId === materialSizeId)?.quantity,
      ),
    ).toBe(expectedSite);
    expect(expectedGodown).toBe(70);
    expect(expectedSite).toBe(15);
  });
});
