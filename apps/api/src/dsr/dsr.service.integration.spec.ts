import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumptionService } from '../inventory/consumption.service';
import { RmcService } from '../rmc/rmc.service';
import { ExpensesService } from '../expenses/expenses.service';
import { DsrService } from './dsr.service';
import type { StorageService } from '../storage/storage.service';

// Real integration test against a live Postgres instance (not a mocked
// Prisma) — this story's core risk is transactional/constraint behavior
// (a partial write must never happen; P2002 on either unique constraint
// must map to the documented ConflictException, not a raw 500), which a
// mock can't meaningfully exercise. Skips itself when no DATABASE_URL is
// configured (e.g. CI without a database service) rather than failing.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const describeIfDb = hasDatabase ? describe : describe.skip;

describeIfDb('DsrService (integration)', () => {
  let prisma: PrismaService;
  let service: DsrService;
  let siteId: string;
  let materialSizeId: string;
  let teamMemberId: string;
  let vendorId: string;
  let categoryId: string;
  let testUserId: string;

  // Story 1.8: create/correct now take the authenticated user id explicitly
  // (threaded from req.user in the controller), instead of resolving a
  // placeholder internally. These thin wrappers pass a real test User so every
  // existing case below reads unchanged.
  const create = (input: Parameters<DsrService['create']>[0]) =>
    service.create(input, testUserId);
  const correct = (
    originalId: string,
    input: Parameters<DsrService['correct']>[1],
    reason: string,
  ) => service.correct(originalId, input, reason, testUserId);

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.onModuleInit();
    const storage = {
      getReadUrl: vi.fn().mockResolvedValue('https://r2.example/signed'),
    } as unknown as StorageService;
    service = new DsrService(prisma, storage);

    const user = await prisma.user.create({
      data: {
        clerkId: `test-submitter-${crypto.randomUUID()}`,
        name: 'Test Submitter',
        email: `test-submitter-${crypto.randomUUID()}@example.com`,
        role: 'OWNER_ADMIN',
      },
    });
    testUserId = user.id;

    const site = await prisma.site.create({
      data: { name: 'Test Site', location: 'Test Location' },
    });
    siteId = site.id;

    const category = await prisma.materialCategory.create({
      data: { name: 'Test Category' },
    });
    const unit = await prisma.unit.create({ data: { name: 'Test Unit' } });
    const material = await prisma.material.create({
      data: { name: 'Test Material', categoryId: category.id, unitId: unit.id },
    });
    const materialSize = await prisma.materialSize.create({
      data: { materialId: material.id, label: 'Test Size' },
    });
    materialSizeId = materialSize.id;

    // "Daily Wage" is seed data (infra/prisma/seed.ts), not a per-test
    // fixture — looked up, never created or deleted here.
    const employmentType = await prisma.employmentType.upsert({
      where: { name: 'Daily Wage' },
      update: {},
      create: { name: 'Daily Wage' },
    });
    const teamMember = await prisma.teamMember.create({
      data: {
        name: 'Test Crew Member',
        employmentTypeId: employmentType.id,
      },
    });
    teamMemberId = teamMember.id;

    const vendor = await prisma.vendor.create({
      data: { name: 'Test Vendor' },
    });
    vendorId = vendor.id;

    const expenseCategory = await prisma.expenseCategory.create({
      data: { name: 'Test Expense Category' },
    });
    categoryId = expenseCategory.id;
  });

  // FR-12: DSR-embedded Consumption now decrements SiteStock, so every
  // test starts from a known balance (and the floor check would reject a
  // consumption against a Site/Material with no stock at all).
  const seedSiteStock = (quantity: number) =>
    prisma.siteStock.upsert({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
      update: { quantity },
      create: { siteId, materialSizeId, quantity },
    });

  const siteStockQuantity = async () => {
    const stock = await prisma.siteStock.findUnique({
      where: { siteId_materialSizeId: { siteId, materialSizeId } },
    });
    return stock?.quantity.toString();
  };

  beforeEach(async () => {
    await seedSiteStock(1000);
  });

  afterEach(async () => {
    // Clean slate between tests without tearing down the shared fixtures.
    // Every delete is scoped to this spec's own fixture Site — the
    // integration specs share one database and run in parallel workers,
    // so a blanket deleteMany({}) here races other suites' fixtures.
    await prisma.expense.deleteMany({ where: { siteId } });
    await prisma.rmcEntry.deleteMany({ where: { siteId } });
    await prisma.consumption.deleteMany({ where: { siteId } });
    await prisma.workRecord.deleteMany({ where: { siteId } });
    await prisma.dailySiteReport.deleteMany({ where: { siteId } });
    await prisma.siteStock.deleteMany({ where: { siteId } });
  });

  afterAll(async () => {
    await prisma.expense.deleteMany({ where: { siteId } });
    await prisma.rmcEntry.deleteMany({ where: { siteId } });
    await prisma.consumption.deleteMany({ where: { siteId } });
    await prisma.workRecord.deleteMany({ where: { siteId } });
    await prisma.dailySiteReport.deleteMany({ where: { siteId } });
    await prisma.siteStock.deleteMany({ where: { siteId } });
    await prisma.teamMember.deleteMany({ where: { id: teamMemberId } });
    const size = await prisma.materialSize.findUnique({
      where: { id: materialSizeId },
      include: { material: true },
    });
    await prisma.materialSize.deleteMany({ where: { id: materialSizeId } });
    if (size) {
      await prisma.material.deleteMany({ where: { id: size.materialId } });
      await prisma.materialCategory.deleteMany({
        where: { id: size.material.categoryId },
      });
      await prisma.unit.deleteMany({ where: { id: size.material.unitId } });
    }
    await prisma.vendor.deleteMany({ where: { id: vendorId } });
    await prisma.expenseCategory.deleteMany({ where: { id: categoryId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await prisma.onModuleDestroy();
  });

  it('creates a DSR with all nested sub-records in a single transaction, with server-computed RMC totals', async () => {
    const result = await create({
      siteId,
      reportDate: '2026-08-10',
      workCompleted: 'RCC pour completed',
      workRecords: [{ teamMemberId, attended: true, hours: 8 }],
      consumptions: [{ materialSizeId, quantity: 10 }],
      rmcEntries: [{ vendorId, quantityM3: 5, grade: 'M25', ratePerM3: 6000 }],
      expenses: [{ categoryId, amount: 500, description: 'Test expense' }],
      equipmentUsed: [{ type: 'MACHINERY', id: 'mach-1', name: 'JCB 3DX' }],
    });

    expect(result.workRecords).toHaveLength(1);
    expect(result.consumptions).toHaveLength(1);
    expect(result.rmcEntries).toHaveLength(1);
    expect(result.expenses).toHaveLength(1);
    // 5 * 6000 — computed server-side, never trusted from a client input.
    expect(result.rmcEntries[0]?.totalAmount.toString()).toBe('30000');
    expect(result.equipmentUsed).toEqual([
      { type: 'MACHINERY', id: 'mach-1', name: 'JCB 3DX' },
    ]);
  });

  it('upserts a second submission for the same Site/date instead of duplicating it (story 3.2: retried offline sync must be idempotent)', async () => {
    const first = await create({
      siteId,
      reportDate: '2026-08-11',
      workCompleted: 'First pass',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    const second = await create({
      siteId,
      reportDate: '2026-08-11',
      workCompleted: 'Retried/edited submission',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    // Same underlying row, last-synced-write-wins on its own fields (AD-8) —
    // never a second row for the same (siteId, reportDate).
    expect(second.id).toBe(first.id);
    expect(second.workCompleted).toBe('Retried/edited submission');
    const rows = await prisma.dailySiteReport.findMany({
      where: { siteId, reportDate: new Date('2026-08-11') },
    });
    expect(rows).toHaveLength(1);
  });

  it('upserts a Consumption/RmcEntry/Expense by clientGeneratedId instead of duplicating it on a retried sync', async () => {
    const clientGeneratedId = 'offline-consumption-1';
    await create({
      siteId,
      reportDate: '2026-08-14',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 10, clientGeneratedId }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    // Same clientGeneratedId, different quantity — simulates the offline
    // queue retrying (or a local edit before the first sync landed).
    const result = await create({
      siteId,
      reportDate: '2026-08-14',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 25, clientGeneratedId }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0]?.quantity.toString()).toBe('25');
    // Stock reflects the final quantity once, not 10 + 25 — the retried
    // sync applied only the delta against the row it already wrote.
    expect(await siteStockQuantity()).toBe('975');
  });

  it('rejects a crew member double-booked at another Site on the same date, not a raw constraint error', async () => {
    const otherSite = await prisma.site.create({
      data: { name: 'Other Site', location: 'Elsewhere' },
    });

    await create({
      siteId,
      reportDate: '2026-08-12',
      workRecords: [{ teamMemberId, attended: true }],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    await expect(
      create({
        siteId: otherSite.id,
        reportDate: '2026-08-12',
        workRecords: [{ teamMemberId, attended: true }],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      }),
    ).rejects.toThrow(ConflictException);

    await prisma.site.delete({ where: { id: otherSite.id } });
  });

  it('does not leave a partial write when a sub-record create fails mid-transaction', async () => {
    await expect(
      create({
        siteId,
        reportDate: '2026-08-13',
        workRecords: [],
        consumptions: [{ materialSizeId: 'does-not-exist', quantity: 1 }],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      }),
    ).rejects.toThrow();

    const dsr = await prisma.dailySiteReport.findFirst({
      where: { siteId, reportDate: new Date('2026-08-13') },
    });
    expect(dsr).toBeNull();
  });

  it("computes crew defaults from the Site's most recent prior attendance, not literally yesterday", async () => {
    // Attendance recorded 3 days before reportDate — Site skipped two days.
    await create({
      siteId,
      reportDate: '2026-08-01',
      workRecords: [{ teamMemberId, attended: true }],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    const defaults = await service.getCrewDefaults(siteId, '2026-08-04');

    expect(defaults).toEqual([{ teamMemberId, name: 'Test Crew Member' }]);
  });

  it('returns an empty crew default list when the Site has no prior attendance at all', async () => {
    const defaults = await service.getCrewDefaults(siteId, '2026-01-01');
    expect(defaults).toEqual([]);
  });

  it('listByDate returns lightweight rows (site/submitter names, sub-record counts) for a given date, not full nested detail', async () => {
    await create({
      siteId,
      reportDate: '2026-08-15',
      workRecords: [{ teamMemberId, attended: true }],
      consumptions: [{ materialSizeId, quantity: 5 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    const rows = await service.listByDate('2026-08-15');

    expect(rows).toHaveLength(1);
    expect(rows[0]?.site).toEqual({ id: siteId, name: 'Test Site' });
    expect(rows[0]?.submittedBy.name).toBe('Test Submitter');
    expect(rows[0]?._count).toEqual({ workRecords: 1, consumptions: 1 });
  });

  it('listByDate returns an empty array for a date with no reports', async () => {
    const rows = await service.listByDate('2099-01-01');
    expect(rows).toEqual([]);
  });

  it('findOne returns the full nested detail — crew, materials, RMC, expenses, photos', async () => {
    const created = await create({
      siteId,
      reportDate: '2026-08-16',
      workCompleted: 'RCC pour completed',
      workRecords: [{ teamMemberId, attended: true, hours: 8 }],
      consumptions: [{ materialSizeId, quantity: 10 }],
      rmcEntries: [{ vendorId, quantityM3: 5, grade: 'M25', ratePerM3: 6000 }],
      expenses: [{ categoryId, amount: 500, description: 'Test expense' }],
      equipmentUsed: [],
    });

    const detail = await service.findOne(created.id);

    expect(detail.site.name).toBe('Test Site');
    expect(detail.workRecords[0]?.teamMember.name).toBe('Test Crew Member');
    expect(detail.consumptions[0]?.materialSize.material.name).toBe(
      'Test Material',
    );
    expect(detail.rmcEntries[0]?.vendor.name).toBe('Test Vendor');
    expect(detail.expenses[0]?.category.name).toBe('Test Expense Category');
    expect(detail.photos).toEqual([]);
  });

  it('findOne resolves each photo to a read URL via StorageService, not the raw storageKey', async () => {
    const created = await create({
      siteId,
      reportDate: '2026-08-17',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    await prisma.photo.create({
      data: {
        dailySiteReportId: created.id,
        storageKey: 'dsr/x/1.jpg',
        uploadedByUserId: created.submittedByUserId,
      },
    });

    const detail = await service.findOne(created.id);

    expect(detail.photos).toHaveLength(1);
    expect(detail.photos[0]?.url).toBe('https://r2.example/signed');
    await prisma.photo.deleteMany({ where: { dailySiteReportId: created.id } });
  });

  it('findOne throws NotFoundException, not a raw null, for an id that does not exist', async () => {
    await expect(service.findOne('does-not-exist')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('correct(): succeeds against a Site/date that already has a DSR, and never touches the original report (AD-9, AC #4)', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-18',
      workCompleted: 'Original text',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    const correction = await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-18',
        workCompleted: 'Corrected text',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'Work completed text was wrong',
    );

    expect(correction.id).not.toBe(original.id);
    expect(correction.correctsId).toBe(original.id);
    expect(correction.reason).toBe('Work completed text was wrong');
    expect(correction.workCompleted).toBe('Corrected text');

    const untouchedOriginal = await prisma.dailySiteReport.findUniqueOrThrow({
      where: { id: original.id },
    });
    expect(untouchedOriginal.workCompleted).toBe('Original text');
    expect(untouchedOriginal.correctsId).toBeNull();
  });

  it("correct(): changing a crew member's attendance inserts a fresh WorkRecord row, never updating the original's (AD-9)", async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-19',
      workRecords: [{ teamMemberId, attended: false }],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const originalWorkRecordId = original.workRecords[0]?.id;

    await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-19',
        workRecords: [{ teamMemberId, attended: true, hours: 8 }],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'Ravi was actually present, not absent',
    );

    const allWorkRecordsForDate = await prisma.workRecord.findMany({
      where: { teamMemberId, workDate: new Date('2026-08-19') },
    });
    expect(allWorkRecordsForDate).toHaveLength(2);

    const untouchedOriginalWorkRecord =
      await prisma.workRecord.findUniqueOrThrow({
        where: { id: originalWorkRecordId },
      });
    expect(untouchedOriginalWorkRecord.attended).toBe(false);
    expect(untouchedOriginalWorkRecord.dailySiteReportId).toBe(original.id);
  });

  it('correct(): throws NotFoundException for an original id that does not exist', async () => {
    await expect(
      correct(
        'does-not-exist',
        {
          siteId,
          reportDate: '2026-08-20',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
        },
        'Some reason',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('correct(): rejects a Site/date that does not match the report being corrected (AC #4)', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-20',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const otherSite = await prisma.site.create({
      data: { name: 'Wrong Site', location: 'Elsewhere' },
    });

    await expect(
      correct(
        original.id,
        {
          siteId: otherSite.id,
          reportDate: '2026-08-20',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
        },
        'Wrong Site',
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(
      correct(
        original.id,
        {
          siteId,
          reportDate: '2026-08-21',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
        },
        'Wrong date',
      ),
    ).rejects.toThrow(BadRequestException);

    await prisma.site.delete({ where: { id: otherSite.id } });
  });

  it('create(): concurrent submissions for the same Site/date never create two "original" rows (AD-8)', async () => {
    const reportDate = '2026-08-25';

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        create({
          siteId,
          reportDate,
          workCompleted: `Attempt ${i}`,
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
        }),
      ),
    );

    const distinctIds = new Set(results.map((r) => r.id));
    expect(distinctIds.size).toBe(1);

    const rows = await prisma.dailySiteReport.findMany({
      where: { siteId, reportDate: new Date(reportDate) },
    });
    expect(rows).toHaveLength(1);
  });

  it('create(): concurrent submissions recording the same crew member on the same date never create two WorkRecord rows', async () => {
    const reportDate = '2026-08-26';

    await Promise.all(
      Array.from({ length: 5 }, () =>
        create({
          siteId,
          reportDate,
          workRecords: [{ teamMemberId, attended: true }],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
        }),
      ),
    );

    const workRecordRows = await prisma.workRecord.findMany({
      where: { teamMemberId, workDate: new Date(reportDate) },
    });
    expect(workRecordRows).toHaveLength(1);

    const dsrRows = await prisma.dailySiteReport.findMany({
      where: { siteId, reportDate: new Date(reportDate) },
    });
    expect(dsrRows).toHaveLength(1);
  });

  it('listByDate(): shows only the current (uncorrected-over) version, not both the original and its correction', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-21',
      workCompleted: 'Original',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const correction = await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-21',
        workCompleted: 'Corrected',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'Fixing the summary',
    );

    const rows = await service.listByDate('2026-08-21');

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(correction.id);
    expect(rows[0]?.workCompleted).toBe('Corrected');
  });

  it('findCurrentForSiteAndDate(): returns the tip of a correction chain, not the original', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-22',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const firstCorrection = await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-22',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'First fix',
    );
    const secondCorrection = await correct(
      firstCorrection.id,
      {
        siteId,
        reportDate: '2026-08-22',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'Second fix',
    );

    const current = await service.findCurrentForSiteAndDate(
      siteId,
      new Date('2026-08-22'),
    );

    expect(current?.id).toBe(secondCorrection.id);
  });

  it('findOne(): reports correctedById when a report has since been corrected, so a stale view can point at the current one', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-23',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    const uncorrected = await service.findOne(original.id);
    expect(uncorrected.correctedById).toBeNull();

    const correction = await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-23',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'A fix',
    );

    const corrected = await service.findOne(original.id);
    expect(corrected.correctedById).toBe(correction.id);
  });

  it('create(): a plain resubmission after a correction has been filed still updates the original, never the correction', async () => {
    const original = await create({
      siteId,
      reportDate: '2026-08-24',
      workCompleted: 'Original',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const correction = await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-24',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'A fix',
    );

    const resubmitted = await create({
      siteId,
      reportDate: '2026-08-24',
      workCompleted: 'Edited again',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    expect(resubmitted.id).toBe(original.id);
    expect(resubmitted.id).not.toBe(correction.id);

    const untouchedCorrection = await prisma.dailySiteReport.findUniqueOrThrow({
      where: { id: correction.id },
    });
    expect(untouchedCorrection.correctsId).toBe(original.id);
  });

  // ---------------------------------------------------------------------
  // FR-12 / FR-14: DSR ↔ Site Stock synchronization (the DSR is an entry
  // surface over the same ledger the standalone Consumption path writes).
  // ---------------------------------------------------------------------

  it('a DSR Consumption decrements SiteStock at the database level (100 − 20 = 80)', async () => {
    await seedSiteStock(100);

    await create({
      siteId,
      reportDate: '2026-08-20',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 20 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });

    expect(await siteStockQuantity()).toBe('80');
    // And the ledger row exists, linked to the DSR (FR-12's retrievability).
    const rows = await prisma.consumption.findMany({ where: { siteId } });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.quantity.toString()).toBe('20');
    expect(rows[0]?.dailySiteReportId).not.toBeNull();
  });

  it('rejects a DSR whose Consumption would take SiteStock below zero, leaving no partial write', async () => {
    await seedSiteStock(5);

    await expect(
      create({
        siteId,
        reportDate: '2026-08-21',
        workRecords: [],
        consumptions: [{ materialSizeId, quantity: 10 }],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      }),
    ).rejects.toThrow(BadRequestException);

    expect(await siteStockQuantity()).toBe('5');
    expect(
      await prisma.dailySiteReport.findFirst({
        where: { siteId, reportDate: new Date('2026-08-21') },
      }),
    ).toBeNull();
  });

  it("a correction reverses the superseded report's stock effect and applies the restated rows (net = restated − original)", async () => {
    await seedSiteStock(100);

    const original = await create({
      siteId,
      reportDate: '2026-08-22',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 20 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    expect(await siteStockQuantity()).toBe('80');

    await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-22',
        workRecords: [],
        consumptions: [{ materialSizeId, quantity: 12 }],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
      },
      'Recount: 12 bags used, not 20',
    );

    // +20 back, −12 restated → 88. The original's rows are untouched (AD-9).
    expect(await siteStockQuantity()).toBe('88');
    const originalRows = await prisma.consumption.findMany({
      where: { dailySiteReportId: original.id },
    });
    expect(originalRows).toHaveLength(1);
    expect(originalRows[0]?.quantity.toString()).toBe('20');
  });

  it("aggregates skip the superseded report's sub-rows — only the correction's restated rows count (FR-54, no double-counting)", async () => {
    await seedSiteStock(100);

    const original = await create({
      siteId,
      reportDate: '2026-08-23',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 20 }],
      rmcEntries: [{ vendorId, quantityM3: 5, grade: 'M25', ratePerM3: 6000 }],
      expenses: [{ categoryId, amount: 500 }],
      equipmentUsed: [],
    });
    await correct(
      original.id,
      {
        siteId,
        reportDate: '2026-08-23',
        workRecords: [],
        consumptions: [{ materialSizeId, quantity: 12 }],
        rmcEntries: [
          { vendorId, quantityM3: 4, grade: 'M25', ratePerM3: 6000 },
        ],
        expenses: [{ categoryId, amount: 450 }],
        equipmentUsed: [],
      },
      'Recount',
    );

    const consumptionService = new ConsumptionService(prisma);
    const consumptions = await consumptionService.list({ siteId });
    expect(consumptions).toHaveLength(1);
    expect(consumptions[0]?.quantity.toString()).toBe('12');

    const rmcService = new RmcService(prisma);
    const rmcEntries = await rmcService.list({ siteId });
    expect(rmcEntries).toHaveLength(1);
    expect(rmcEntries[0]?.quantityM3.toString()).toBe('4');

    const expensesService = new ExpensesService(prisma);
    const expenses = await expensesService.list({ siteId });
    expect(expenses).toHaveLength(1);
    expect(expenses[0]?.amount.toString()).toBe('450');

    // The materialized stock reconciles to the re-summed ledger under the
    // same rule: superseded-DSR rows are excluded (their effect was
    // reversed when the correction was filed) — FR-14 extended to DSRs.
    expect(await siteStockQuantity()).toBe('88');
  });

  it('rejects a second correction of an already-corrected report — the stock reversal must only ever run once', async () => {
    await seedSiteStock(100);

    const original = await create({
      siteId,
      reportDate: '2026-08-24',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 20 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    });
    const payload = {
      siteId,
      reportDate: '2026-08-24',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 12 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
    };
    await correct(original.id, payload, 'First correction');

    await expect(
      correct(original.id, payload, 'Second correction of the same report'),
    ).rejects.toThrow(ConflictException);
    expect(await siteStockQuantity()).toBe('88');
  });
});
