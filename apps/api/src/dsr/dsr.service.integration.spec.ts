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
import { WasteDisposalService } from '../waste-disposal/waste-disposal.service';
import { DsrService } from './dsr.service';
import { getSitePhotoGallery } from '../sites/site-photo-gallery';
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
  let subcontractorId: string;
  let testUserId: string;
  let otherUserId: string;
  let sendToRole: ReturnType<typeof vi.fn>;
  let storage: StorageService;

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
    storage = {
      getThumbnailUrl: vi
        .fn()
        .mockResolvedValue('https://cloudinary.example/thumb'),
    } as unknown as StorageService;
    sendToRole = vi.fn().mockResolvedValue(undefined);
    const pushNotifications = { sendToRole };
    service = new DsrService(prisma, storage, pushNotifications as never);

    const user = await prisma.user.create({
      data: {
        name: 'Test Submitter',
        email: `test-submitter-${crypto.randomUUID()}@example.com`,
        passwordHash: 'test-hash',
        role: 'OWNER_ADMIN',
      },
    });
    testUserId = user.id;

    // spec-dsr-drafts (review item 2): a second author, so the drafts-are-
    // private-per-supervisor tests can assert one Supervisor never sees or
    // deletes another's draft for the same (site,date).
    const otherUser = await prisma.user.create({
      data: {
        name: 'Other Supervisor',
        email: `other-supervisor-${crypto.randomUUID()}@example.com`,
        passwordHash: 'test-hash',
        role: 'SITE_SUPERVISOR',
      },
    });
    otherUserId = otherUser.id;

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

    const subcontractor = await prisma.subcontractor.create({
      data: { name: 'Test Subcontractor' },
    });
    subcontractorId = subcontractor.id;
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
    await prisma.wasteDisposal.deleteMany({ where: { siteId } });
    await prisma.subcontractorWorkEntry.deleteMany({
      where: { siteContract: { siteId } },
    });
    await prisma.siteContract.deleteMany({ where: { siteId } });
    // spec-dsr-drafts: photos FK the DSR row — clear them before the parent.
    await prisma.photo.deleteMany({ where: { dailySiteReport: { siteId } } });
    await prisma.dailySiteReport.deleteMany({ where: { siteId } });
    await prisma.siteStock.deleteMany({ where: { siteId } });
  });

  afterAll(async () => {
    await prisma.expense.deleteMany({ where: { siteId } });
    await prisma.rmcEntry.deleteMany({ where: { siteId } });
    await prisma.consumption.deleteMany({ where: { siteId } });
    await prisma.workRecord.deleteMany({ where: { siteId } });
    await prisma.wasteDisposal.deleteMany({ where: { siteId } });
    await prisma.subcontractorWorkEntry.deleteMany({
      where: { siteContract: { siteId } },
    });
    await prisma.siteContract.deleteMany({ where: { siteId } });
    // spec-dsr-drafts: photos FK the DSR row — clear them before the parent.
    await prisma.photo.deleteMany({ where: { dailySiteReport: { siteId } } });
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
    await prisma.subcontractor.deleteMany({ where: { id: subcontractorId } });
    await prisma.site.deleteMany({ where: { id: siteId } });
    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, otherUserId] } },
    });
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    expect(result.workRecords).toHaveLength(1);
    expect(result.consumptions).toHaveLength(1);
    expect(result.rmcEntries).toHaveLength(1);
    expect(result.expenses).toHaveLength(1);
    // 5 * 6000 — computed server-side, never trusted from a client input.
    expect(result.rmcEntries[0]?.totalAmount?.toString()).toBe('30000');
    expect(result.equipmentUsed).toEqual([
      { type: 'MACHINERY', id: 'mach-1', name: 'JCB 3DX' },
    ]);
  });

  // Matrix Test Audit (client-readiness batch, goal 1): a DSR-embedded RMC
  // entry with no rate yet (pricing pending) must store totalAmount as
  // null, never NaN from multiplying against a missing rate.
  it('a DSR-embedded RMC entry with ratePerM3 omitted stores totalAmount as null, not NaN', async () => {
    const result = await create({
      siteId,
      reportDate: '2026-08-09',
      workRecords: [],
      consumptions: [],
      rmcEntries: [{ vendorId, quantityM3: 5, grade: 'M25' }],
      expenses: [],
      equipmentUsed: [],
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    expect(result.rmcEntries[0]?.totalAmount).toBeNull();
    expect(result.rmcEntries[0]?.ratePerM3).toBeNull();
  });

  it('upserts a second submission for the same Site/date instead of duplicating it (story 3.2: retried offline sync must be idempotent)', async () => {
    const callsBefore = sendToRole.mock.calls.length;

    const first = await create({
      siteId,
      reportDate: '2026-08-11',
      workCompleted: 'First pass',
      workRecords: [],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    // Same underlying row, last-synced-write-wins on its own fields (AD-8) —
    // never a second row for the same (siteId, reportDate).
    expect(second.id).toBe(first.id);
    expect(second.workCompleted).toBe('Retried/edited submission');
    const rows = await prisma.dailySiteReport.findMany({
      where: { siteId, reportDate: new Date('2026-08-11') },
    });
    expect(rows).toHaveLength(1);

    // The retried/edited resubmission must not re-notify Owner/Admin — only
    // the first submission for a Site/date fires "Daily Report submitted".
    expect(sendToRole.mock.calls.length - callsBefore).toBe(1);
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    expect(result.consumptions).toHaveLength(1);
    expect(result.consumptions[0]?.quantity.toString()).toBe('25');
    // Stock reflects the final quantity once, not 10 + 25 — the retried
    // sync applied only the delta against the row it already wrote.
    expect(await siteStockQuantity()).toBe('975');
  });

  it('allows a crew member to work multiple Sites on the same date (client-readiness batch, goal 6)', async () => {
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    await create({
      siteId: otherSite.id,
      reportDate: '2026-08-12',
      workRecords: [{ teamMemberId, attended: true }],
      consumptions: [],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    const records = await prisma.workRecord.findMany({
      where: { teamMemberId, workDate: new Date('2026-08-12') },
    });
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.siteId).sort()).toEqual(
      [siteId, otherSite.id].sort(),
    );

    await prisma.workRecord.deleteMany({ where: { siteId: otherSite.id } });
    await prisma.dailySiteReport.deleteMany({
      where: { siteId: otherSite.id },
    });
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
    expect(detail.photos[0]?.url).toBe('https://cloudinary.example/thumb');
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
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
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
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
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
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
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
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
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
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
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });
    const payload = {
      siteId,
      reportDate: '2026-08-24',
      workRecords: [],
      consumptions: [{ materialSizeId, quantity: 12 }],
      rmcEntries: [],
      expenses: [],
      equipmentUsed: [],
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    };
    await correct(original.id, payload, 'First correction');

    await expect(
      correct(original.id, payload, 'Second correction of the same report'),
    ).rejects.toThrow(ConflictException);
    expect(await siteStockQuantity()).toBe('88');
  });

  // ---------- spec-dsr-drafts: DRAFT | SUBMITTED lifecycle ----------

  describe('drafts (deferred sync)', () => {
    const draftInput = (reportDate: string, quantity = 50) => ({
      siteId,
      reportDate,
      workCompleted: 'Draft in progress',
      workRecords: [{ teamMemberId, attended: true }],
      consumptions: [{ materialSizeId, quantity }],
      rmcEntries: [{ vendorId, quantityM3: 3, grade: 'M25', ratePerM3: 5000 }],
      expenses: [{ categoryId, amount: 700, description: 'Draft expense' }],
      equipmentUsed: [],
      subcontractorEntries: [],
      labourEntries: [],
      wasteDisposalEntries: [],
    });

    const ledgerCounts = async () => ({
      consumptions: await prisma.consumption.count({ where: { siteId } }),
      expenses: await prisma.expense.count({ where: { siteId } }),
      rmcEntries: await prisma.rmcEntry.count({ where: { siteId } }),
      workRecords: await prisma.workRecord.count({ where: { siteId } }),
    });

    it('a DRAFT creates NO ledger rows and applies NO stock delta', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-01'),
        testUserId,
      );

      expect(await ledgerCounts()).toEqual({
        consumptions: 0,
        expenses: 0,
        rmcEntries: 0,
        workRecords: 0,
      });
      // Stock untouched.
      expect(await siteStockQuantity()).toBe('1000');
      // The draft row exists but is DRAFT and holds its sub-records as JSON.
      const row = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id },
      });
      expect(row.status).toBe('DRAFT');
      expect(row.draftContent).not.toBeNull();
    });

    it('a DRAFT is excluded from the /daily-activity log', async () => {
      await service.saveDraft(draftInput('2026-09-02'), testUserId);
      const rows = await service.listByDate('2026-09-02');
      expect(rows).toHaveLength(0);
    });

    it('resumes the persisted draft per (site,date) via getDraft', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-03', 40),
        testUserId,
      );
      const draft = await service.getDraft(siteId, '2026-09-03', testUserId);
      expect(draft?.id).toBe(id);
      expect(draft?.consumptions).toHaveLength(1);
      expect(draft?.consumptions[0]?.quantity).toBe(40);
      expect(draft?.workRecords).toHaveLength(1);

      // No draft for a different date → null (empty form).
      expect(
        await service.getDraft(siteId, '2026-09-30', testUserId),
      ).toBeNull();
    });

    it('a repeated saveDraft upserts the single draft row (no fork)', async () => {
      const first = await service.saveDraft(
        draftInput('2026-09-04', 10),
        testUserId,
      );
      const second = await service.saveDraft(
        draftInput('2026-09-04', 25),
        testUserId,
      );
      expect(second.id).toBe(first.id);
      const rows = await prisma.dailySiteReport.findMany({
        where: { siteId, reportDate: new Date('2026-09-04') },
      });
      expect(rows).toHaveLength(1);
      const draft = await service.getDraft(siteId, '2026-09-04', testUserId);
      expect(draft?.consumptions[0]?.quantity).toBe(25);
    });

    it('Finalize materialises sub-records, decrements stock exactly once, and reveals the report', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-05'),
        testUserId,
      );
      const finalized = await service.finalizeDraft(id, testUserId);

      expect(finalized.status).toBe('SUBMITTED');
      expect(finalized.consumptions).toHaveLength(1);
      expect(finalized.expenses).toHaveLength(1);
      expect(finalized.rmcEntries).toHaveLength(1);
      expect(finalized.workRecords).toHaveLength(1);
      // draftContent cleared post-finalize.
      const row = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id },
      });
      expect(row.draftContent).toBeNull();

      expect(await ledgerCounts()).toEqual({
        consumptions: 1,
        expenses: 1,
        rmcEntries: 1,
        workRecords: 1,
      });
      // 1000 - 50, applied once.
      expect(await siteStockQuantity()).toBe('950');
      // Now visible in the /daily-activity log.
      const rows = await service.listByDate('2026-09-05');
      expect(rows).toHaveLength(1);
    });

    // spec-dsr-activity-sync-detail-panel (goal 3, follow-up fix): Waste
    // Material is a real-row-materializing sub-record exactly like RMC/
    // Consumption/Expense — it must be deferred via draftContent and survive
    // save -> resume -> Finalize the same way those do, closing the gap
    // flagged during this feature's own implementation (a Waste Material
    // row typed before Save Draft was silently vanishing on Resume).
    it('a Waste Material row typed before Save Draft survives save -> resume -> Finalize', async () => {
      const input = {
        ...draftInput('2026-09-19'),
        wasteDisposalEntries: [
          { wasteType: 'Debris', ownership: 'OWN' as const, tripCount: 3 },
        ],
      };
      const { id } = await service.saveDraft(input, testUserId);

      const resumed = await service.getDraft(siteId, '2026-09-19', testUserId);
      expect(resumed?.wasteDisposalEntries).toHaveLength(1);
      expect(resumed?.wasteDisposalEntries[0]?.tripCount).toBe(3);

      const finalized = await service.finalizeDraft(id, testUserId);
      expect(finalized.wasteDisposalEntries).toHaveLength(1);
      expect(finalized.wasteDisposalEntries[0]?.tripCount).toBe(3);
    });

    it('save → resume → Finalize decrements stock exactly once (reload no-double-count)', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-06', 30),
        testUserId,
      );
      // Simulate a reload: re-read the draft, then finalize the SAME row.
      const resumed = await service.getDraft(siteId, '2026-09-06', testUserId);
      expect(resumed?.id).toBe(id);
      await service.finalizeDraft(id, testUserId);

      expect(await prisma.consumption.count({ where: { siteId } })).toBe(1);
      expect(await siteStockQuantity()).toBe('970');
    });

    it('Finalize with insufficient stock rolls back entirely and stays DRAFT', async () => {
      // Only 5 in stock, draft consumes 50.
      await seedSiteStock(5);
      const { id } = await service.saveDraft(
        draftInput('2026-09-07', 50),
        testUserId,
      );

      await expect(service.finalizeDraft(id, testUserId)).rejects.toThrow(
        BadRequestException,
      );

      // Nothing materialised, stock untouched, row still DRAFT.
      expect(await ledgerCounts()).toEqual({
        consumptions: 0,
        expenses: 0,
        rmcEntries: 0,
        workRecords: 0,
      });
      expect(await siteStockQuantity()).toBe('5');
      const row = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id },
      });
      expect(row.status).toBe('DRAFT');
    });

    it('Finalize on a non-draft (SUBMITTED) id is rejected with 409, no double sync', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-08'),
        testUserId,
      );
      await service.finalizeDraft(id, testUserId);
      expect(await siteStockQuantity()).toBe('950');

      await expect(service.finalizeDraft(id, testUserId)).rejects.toThrow(
        ConflictException,
      );
      // Stock unchanged — no second decrement.
      expect(await siteStockQuantity()).toBe('950');
      expect(await prisma.consumption.count({ where: { siteId } })).toBe(1);
    });

    it('Discard hard-deletes the draft and its photos; no ledger rows ever existed', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-09'),
        testUserId,
      );
      const photo = await prisma.photo.create({
        data: {
          dailySiteReportId: id,
          storageKey: 'dsr/draft/one.jpg',
          uploadedByUserId: testUserId,
        },
      });

      await service.deleteDraft(id, testUserId);

      expect(
        await prisma.dailySiteReport.findUnique({ where: { id } }),
      ).toBeNull();
      expect(
        await prisma.photo.findUnique({ where: { id: photo.id } }),
      ).toBeNull();
      expect(await ledgerCounts()).toEqual({
        consumptions: 0,
        expenses: 0,
        rmcEntries: 0,
        workRecords: 0,
      });
      expect(await siteStockQuantity()).toBe('1000');
    });

    it('Discard refuses a SUBMITTED report (correct it instead)', async () => {
      const submitted = await create({
        siteId,
        reportDate: '2026-09-10',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
      });
      await expect(
        service.deleteDraft(submitted.id, testUserId),
      ).rejects.toThrow(ConflictException);
      // Still there.
      expect(
        await prisma.dailySiteReport.findUnique({
          where: { id: submitted.id },
        }),
      ).not.toBeNull();
    });

    it("a draft's photos are hidden from the Site gallery until Finalize", async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-11'),
        testUserId,
      );
      await prisma.photo.create({
        data: {
          dailySiteReportId: id,
          storageKey: 'dsr/draft/gallery.jpg',
          uploadedByUserId: testUserId,
        },
      });

      // Hidden while DRAFT.
      expect(await getSitePhotoGallery(prisma, storage, siteId)).toHaveLength(
        0,
      );

      await service.finalizeDraft(id, testUserId);

      // Revealed after Finalize.
      const gallery = await getSitePhotoGallery(prisma, storage, siteId);
      expect(gallery).toHaveLength(1);
      expect(gallery[0]?.dailySiteReportId).toBe(id);
    });

    it('findOne treats a DRAFT as not-found (private, unmaterialised)', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-12'),
        testUserId,
      );
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });

    // ---------- review items 1, 2, 6, 8 ----------

    it('saveDraft is blocked with 409 once a report is already SUBMITTED for that (site,date) — use Correct', async () => {
      await create({
        siteId,
        reportDate: '2026-09-13',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      await expect(
        service.saveDraft(draftInput('2026-09-13'), testUserId),
      ).rejects.toThrow(ConflictException);
      // No draft row was created.
      expect(
        await service.getDraft(siteId, '2026-09-13', testUserId),
      ).toBeNull();
    });

    it('finalize is rejected with 409 when a SUBMITTED original already exists for the (site,date)', async () => {
      // A draft first (allowed — nothing submitted yet)...
      const { id } = await service.saveDraft(
        draftInput('2026-09-14', 10),
        testUserId,
      );
      // ...then a one-shot SUBMITTED report lands for the same day (create()
      // ignores the draft and inserts its own SUBMITTED row).
      await create({
        siteId,
        reportDate: '2026-09-14',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      await expect(service.finalizeDraft(id, testUserId)).rejects.toThrow(
        ConflictException,
      );
      // The draft is untouched (still DRAFT) and materialised nothing.
      const row = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id },
      });
      expect(row.status).toBe('DRAFT');
      expect(await prisma.consumption.count({ where: { siteId } })).toBe(0);
    });

    it('drafts are private per supervisor — another author never sees or deletes them, and each author keeps their own', async () => {
      const mine = await service.saveDraft(
        draftInput('2026-09-15', 10),
        testUserId,
      );

      // The other Supervisor sees no draft for this (site,date)...
      expect(
        await service.getDraft(siteId, '2026-09-15', otherUserId),
      ).toBeNull();
      // ...and cannot delete mine (private ⇒ not found to them).
      await expect(service.deleteDraft(mine.id, otherUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        await prisma.dailySiteReport.findUnique({ where: { id: mine.id } }),
      ).not.toBeNull();

      // The other author can hold their OWN draft for the same (site,date) —
      // the partial unique index is per-author.
      const theirs = await service.saveDraft(
        draftInput('2026-09-15', 20),
        otherUserId,
      );
      expect(theirs.id).not.toBe(mine.id);
      expect(
        (await service.getDraft(siteId, '2026-09-15', otherUserId))?.id,
      ).toBe(theirs.id);
      expect(
        (await service.getDraft(siteId, '2026-09-15', testUserId))?.id,
      ).toBe(mine.id);
    });

    it('finalize preserves the draft author, even when a different user finalizes it', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-16', 10),
        otherUserId,
      );
      const finalized = await service.finalizeDraft(id, testUserId);
      // The report is still attributed to whoever built the draft.
      expect(finalized.submittedByUserId).toBe(otherUserId);
    });

    it('correct() refuses a DRAFT target — a draft cannot be corrected', async () => {
      const { id } = await service.saveDraft(
        draftInput('2026-09-17'),
        testUserId,
      );
      await expect(
        correct(
          id,
          {
            siteId,
            reportDate: '2026-09-17',
            workRecords: [],
            consumptions: [],
            rmcEntries: [],
            expenses: [],
            equipmentUsed: [],
            subcontractorEntries: [],
            labourEntries: [],
            wasteDisposalEntries: [],
          },
          'Attempted correction of a draft',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('finalize surfaces a friendly BadRequest when a referenced entity was deleted after save', async () => {
      // A throwaway Vendor referenced only by this draft's RMC entry.
      const tempVendor = await prisma.vendor.create({
        data: { name: `Temp Vendor ${crypto.randomUUID()}` },
      });
      const { id } = await service.saveDraft(
        {
          siteId,
          reportDate: '2026-09-18',
          workRecords: [],
          consumptions: [],
          rmcEntries: [
            {
              vendorId: tempVendor.id,
              quantityM3: 2,
              grade: 'M25',
              ratePerM3: 5000,
            },
          ],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [],
        },
        testUserId,
      );
      // The Vendor vanishes before finalize.
      await prisma.vendor.delete({ where: { id: tempVendor.id } });

      await expect(service.finalizeDraft(id, testUserId)).rejects.toThrow(
        BadRequestException,
      );
      // Rolled back — still a draft, nothing materialised.
      const row = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id },
      });
      expect(row.status).toBe('DRAFT');
      expect(await prisma.rmcEntry.count({ where: { siteId } })).toBe(0);
    });
  });

  // spec-dsr-activity-sync-detail-panel, goal 3: mirrors the RMC
  // pricing-pending/correction test set above, plus the correctsId-chain
  // divergence this feature's Design Notes call out explicitly.
  describe('Waste Material DSR entries (client-readiness batch, goal 3)', () => {
    it('a DSR-embedded Waste Material entry with ratePerTrip omitted stores totalAmount/paymentStatus as null — "Pricing pending", never ₹0', async () => {
      const result = await create({
        siteId,
        reportDate: '2026-09-21',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          { wasteType: 'Debris', ownership: 'OWN', tripCount: 3 },
        ],
      });

      expect(result.wasteDisposalEntries).toHaveLength(1);
      expect(result.wasteDisposalEntries[0]?.totalAmount).toBeNull();
      expect(result.wasteDisposalEntries[0]?.paymentStatus).toBeNull();
    });

    it('server-computes totalAmount (tripCount × ratePerTrip + otherCharges) for a priced HIRED entry', async () => {
      const result = await create({
        siteId,
        reportDate: '2026-09-22',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Excavated earth',
            ownership: 'HIRED',
            vendorId,
            tripCount: 4,
            ratePerTrip: 1500,
            otherCharges: 200,
            paymentStatus: 'UNPAID',
          },
        ],
      });

      expect(result.wasteDisposalEntries[0]?.totalAmount?.toString()).toBe(
        '6200',
      );
    });

    it('correct(): a matched Waste Material entry (via clientGeneratedId) is linked via correctsId, and WasteDisposalService.summary() reflects only the restated amount — never both', async () => {
      const original = await create({
        siteId,
        reportDate: '2026-09-23',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'HIRED',
            vendorId,
            tripCount: 5,
            ratePerTrip: 1000,
            paymentStatus: 'UNPAID',
            clientGeneratedId: 'waste-cg-1',
          },
        ],
      });
      const originalRow = original.wasteDisposalEntries[0]!;
      expect(originalRow.totalAmount?.toString()).toBe('5000');

      await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-09-23',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'HIRED',
              vendorId,
              tripCount: 3,
              ratePerTrip: 1000,
              paymentStatus: 'UNPAID',
              clientGeneratedId: 'waste-cg-1',
            },
          ],
        },
        'Recount: 3 trips, not 5',
      );

      const correctionRow = await prisma.wasteDisposal.findFirst({
        where: { correctsId: originalRow.id },
      });
      expect(correctionRow).not.toBeNull();
      // Delta, not a restated absolute: 3 − 5 = −2 trips → −2000.
      expect(correctionRow?.tripCount).toBe(-2);
      expect(correctionRow?.totalAmount?.toString()).toBe('-2000');

      const wasteDisposalService = new WasteDisposalService(prisma);
      const summary = await wasteDisposalService.summary({ siteId });
      // 5000 (original) − 2000 (correction) = 3000 — the restated amount
      // only, never 5000 + 3000 (which double-counting would produce).
      expect(summary.totalCost).toBe(3000);
    });

    it('correct(): a Waste Material entry with no matching clientGeneratedId in the superseded report is treated as a fresh, un-linked row', async () => {
      const original = await create({
        siteId,
        reportDate: '2026-09-24',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-09-24',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'OWN',
              tripCount: 2,
              clientGeneratedId: 'brand-new-row',
            },
          ],
        },
        'Actually there was a Waste Material trip too',
      );

      const rows = await prisma.wasteDisposal.findMany({
        where: { siteId, wasteType: 'Debris' },
      });
      expect(rows).toHaveLength(1);
      expect(rows[0]?.correctsId).toBeNull();
      expect(rows[0]?.tripCount).toBe(2);
    });

    // Review fix (finding #12): idempotency parity with the existing
    // Consumption/RmcEntry/Expense retry test.
    it('upserts a Waste Material entry by clientGeneratedId instead of duplicating it on a retried sync', async () => {
      const dsr1 = await create({
        siteId,
        reportDate: '2026-10-02',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'OWN',
            tripCount: 2,
            clientGeneratedId: 'waste-retry-1',
          },
        ],
      });
      const dsr2 = await create({
        siteId,
        reportDate: '2026-10-02',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'OWN',
            tripCount: 2,
            clientGeneratedId: 'waste-retry-1',
          },
        ],
      });
      expect(dsr2.id).toBe(dsr1.id);
      const rows = await prisma.wasteDisposal.findMany({
        where: { clientGeneratedId: 'waste-retry-1' },
      });
      expect(rows).toHaveLength(1);
    });

    // Review fix (finding #2): a second correction of the same entry must
    // delta against its TRUE current cumulative state (5 → 3 → 6 means the
    // second correction's delta is +3, not "6 − (−2)" using the first
    // correction's own delta row as if it were an absolute value).
    it("correct(): a SECOND correction of the same Waste Material entry deltas against the true cumulative total, not the first correction's raw delta row", async () => {
      const original = await create({
        siteId,
        reportDate: '2026-10-03',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'HIRED',
            vendorId,
            tripCount: 5,
            ratePerTrip: 1000,
            paymentStatus: 'UNPAID',
            clientGeneratedId: 'waste-cg-2',
          },
        ],
      });

      const firstCorrection = await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-10-03',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'HIRED',
              vendorId,
              tripCount: 3,
              ratePerTrip: 1000,
              paymentStatus: 'UNPAID',
              clientGeneratedId: 'waste-cg-2',
            },
          ],
        },
        'Recount: 3 trips, not 5',
      );

      await correct(
        firstCorrection.id,
        {
          siteId,
          reportDate: '2026-10-03',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'HIRED',
              vendorId,
              tripCount: 6,
              ratePerTrip: 1000,
              paymentStatus: 'UNPAID',
              clientGeneratedId: 'waste-cg-2',
            },
          ],
        },
        'Recount again: 6 trips, not 3',
      );

      const wasteDisposalService = new WasteDisposalService(prisma);
      const summary = await wasteDisposalService.summary({ siteId });
      // 5 trips × 1000 = 5000 is the TRUE final total — a bug that deltas
      // against the first correction's own delta row (-2000) would instead
      // compute 6000 − (-2000) = 8000 for the second correction, totalling
      // 5000 + 8000 = 13000.
      expect(summary.totalCost).toBe(6000);
      expect(summary.totalTrips).toBe(6);
    });

    // Review fix (finding #3): a correction that only adds/changes a rate
    // (tripCount unchanged) must still produce the correct nonzero delta —
    // tripCountDelta × newRate is always 0 in this scenario.
    it('correct(): adding a rate to a previously-unpriced entry with unchanged tripCount produces the correct nonzero totalAmount delta', async () => {
      const original = await create({
        siteId,
        reportDate: '2026-10-04',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'HIRED',
            vendorId,
            tripCount: 4,
            clientGeneratedId: 'waste-cg-3',
          },
        ],
      });
      expect(original.wasteDisposalEntries[0]?.totalAmount).toBeNull();

      await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-10-04',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'HIRED',
              vendorId,
              tripCount: 4,
              ratePerTrip: 1000,
              paymentStatus: 'UNPAID',
              clientGeneratedId: 'waste-cg-3',
            },
          ],
        },
        'Pricing now known: 1000/trip',
      );

      const wasteDisposalService = new WasteDisposalService(prisma);
      const summary = await wasteDisposalService.summary({ siteId });
      expect(summary.totalCost).toBe(4000);
    });

    // Review fix (finding #3): a correction that changes only the rate
    // (tripCount unchanged) must also produce the correct delta.
    it('correct(): changing only the rate on an already-priced entry produces the correct totalAmount delta', async () => {
      const original = await create({
        siteId,
        reportDate: '2026-10-05',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'HIRED',
            vendorId,
            tripCount: 4,
            ratePerTrip: 1000,
            paymentStatus: 'UNPAID',
            clientGeneratedId: 'waste-cg-4',
          },
        ],
      });
      expect(original.wasteDisposalEntries[0]?.totalAmount?.toString()).toBe(
        '4000',
      );

      await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-10-05',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'HIRED',
              vendorId,
              tripCount: 4,
              ratePerTrip: 1500,
              paymentStatus: 'UNPAID',
              clientGeneratedId: 'waste-cg-4',
            },
          ],
        },
        'Rate was actually 1500/trip, not 1000',
      );

      const wasteDisposalService = new WasteDisposalService(prisma);
      const summary = await wasteDisposalService.summary({ siteId });
      // 4 × 1500 = 6000 is the true total (4 × 1000 original + 4 × 500 delta).
      expect(summary.totalCost).toBe(6000);
    });

    // Review fix (finding #4): dropping an already-materialized entry from
    // a correction's submission must be refused, not silently orphaned.
    it('correct(): refuses to drop an already-materialized Waste Material entry that is absent from the new submission', async () => {
      const original = await create({
        siteId,
        reportDate: '2026-10-06',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'OWN',
            tripCount: 3,
            clientGeneratedId: 'waste-cg-5',
          },
        ],
      });

      await expect(
        correct(
          original.id,
          {
            siteId,
            reportDate: '2026-10-06',
            workRecords: [],
            consumptions: [],
            rmcEntries: [],
            expenses: [],
            equipmentUsed: [],
            subcontractorEntries: [],
            labourEntries: [],
            wasteDisposalEntries: [],
          },
          'Forgot to restate the Waste Material row',
        ),
      ).rejects.toThrow(BadRequestException);

      // No partial write: no correcting DSR should exist either.
      const corrections = await prisma.dailySiteReport.findMany({
        where: { correctsId: original.id },
      });
      expect(corrections).toHaveLength(0);
    });
  });

  // spec-dsr-activity-sync-detail-panel, goal 4.
  describe('Subcontractor Work Entries via DSR (client-readiness batch, goal 4)', () => {
    async function createActiveContract(rateType = 'PER_TRIP') {
      return prisma.siteContract.create({
        data: {
          subcontractorId,
          siteId,
          status: 'ACTIVE',
          rateType,
          rateUnitLabel: 'trips',
        },
      });
    }

    it('an entry with workNote only stays informational — no SubcontractorWorkEntry is created', async () => {
      const result = await create({
        siteId,
        reportDate: '2026-09-25',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [{ subcontractorId, workNote: 'On site today' }],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      expect(result.subcontractorWorkEntries).toHaveLength(0);
      const dsr = await prisma.dailySiteReport.findUniqueOrThrow({
        where: { id: result.id },
      });
      expect(dsr.subcontractorEntries).toEqual([
        { subcontractorId, workNote: 'On site today' },
      ]);
    });

    it('an entry with a picked Active, non-Fixed-Cost Site Contract + quantity creates a real SubcontractorWorkEntry and increments quantityCompleted', async () => {
      const contract = await createActiveContract();

      const result = await create({
        siteId,
        reportDate: '2026-09-26',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 6,
            clientGeneratedId: 'sub-cg-1',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      expect(result.subcontractorWorkEntries).toHaveLength(1);
      expect(result.subcontractorWorkEntries[0]?.quantity.toString()).toBe('6');
      const updatedContract = await prisma.siteContract.findUniqueOrThrow({
        where: { id: contract.id },
      });
      expect(updatedContract.quantityCompleted.toString()).toBe('6');
    });

    it('rejects the whole DSR when the picked Site Contract is Fixed Cost, with the same BadRequestException shape WorkEntriesService.create() uses', async () => {
      const contract = await createActiveContract('FIXED_COST');

      await expect(
        create({
          siteId,
          reportDate: '2026-09-27',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            { subcontractorId, siteContractId: contract.id, quantity: 6 },
          ],
          labourEntries: [],
          wasteDisposalEntries: [],
        }),
      ).rejects.toThrow(BadRequestException);

      // No partial write: the DSR itself must not have been created either.
      const rows = await prisma.dailySiteReport.findMany({
        where: { siteId, reportDate: new Date('2026-09-27') },
      });
      expect(rows).toHaveLength(0);
    });

    it('correct(): a matched entry (via clientGeneratedId) applies a signed delta to quantityCompleted, not a second absolute increment', async () => {
      const contract = await createActiveContract();
      const original = await create({
        siteId,
        reportDate: '2026-09-28',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 10,
            clientGeneratedId: 'sub-cg-2',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      });
      expect(
        (
          await prisma.siteContract.findUniqueOrThrow({
            where: { id: contract.id },
          })
        ).quantityCompleted.toString(),
      ).toBe('10');

      await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-09-28',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            {
              subcontractorId,
              siteContractId: contract.id,
              quantity: 7,
              clientGeneratedId: 'sub-cg-2',
            },
          ],
          labourEntries: [],
          wasteDisposalEntries: [],
        },
        'Recount: 7 trips, not 10',
      );

      const updatedContract = await prisma.siteContract.findUniqueOrThrow({
        where: { id: contract.id },
      });
      // 10 − 3 (delta of 7 − 10) = 7 — the restated amount, never 10 + 7.
      expect(updatedContract.quantityCompleted.toString()).toBe('7');
      const correctionEntry = await prisma.subcontractorWorkEntry.findFirst({
        where: { siteContractId: contract.id, quantity: { lt: 0 } },
      });
      expect(correctionEntry?.correctsId).toBe(
        original.subcontractorWorkEntries[0]!.id,
      );
    });

    it('a historical DSR whose subcontractorEntries JSON has no siteContractId still renders/validates unchanged', async () => {
      const dsr = await prisma.dailySiteReport.create({
        data: {
          siteId,
          reportDate: new Date('2026-09-29'),
          submittedByUserId: testUserId,
          subcontractorEntries: [
            { subcontractorId, workNote: 'Pre-existing historical row' },
          ],
        },
      });

      const detail = await service.findOne(dsr.id);
      expect(detail.subcontractorEntries).toEqual([
        { subcontractorId, workNote: 'Pre-existing historical row' },
      ]);
    });

    // Review fix (finding #12): idempotency parity with the existing
    // Consumption/RmcEntry/Expense retry test.
    it('does not double-create a Work Entry (or double-increment quantityCompleted) on a retried sync with the same clientGeneratedId', async () => {
      const contract = await createActiveContract();
      const input = {
        siteId,
        reportDate: '2026-10-07',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 5,
            clientGeneratedId: 'sub-retry-1',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      };
      const dsr1 = await create(input);
      const dsr2 = await create(input);
      expect(dsr2.id).toBe(dsr1.id);

      const rows = await prisma.subcontractorWorkEntry.findMany({
        where: { clientGeneratedId: 'sub-retry-1' },
      });
      expect(rows).toHaveLength(1);
      const updatedContract = await prisma.siteContract.findUniqueOrThrow({
        where: { id: contract.id },
      });
      expect(updatedContract.quantityCompleted.toString()).toBe('5');
    });

    // Review fix (finding #2): a second correction must delta against the
    // TRUE current cumulative quantity, not the first correction's own
    // delta row treated as if it were an absolute value.
    it("correct(): a SECOND correction of the same Work Entry deltas against the true cumulative quantity, not the first correction's raw delta row", async () => {
      const contract = await createActiveContract();
      const original = await create({
        siteId,
        reportDate: '2026-10-08',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 10,
            clientGeneratedId: 'sub-cg-3',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      const firstCorrection = await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-10-08',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            {
              subcontractorId,
              siteContractId: contract.id,
              quantity: 7,
              clientGeneratedId: 'sub-cg-3',
            },
          ],
          labourEntries: [],
          wasteDisposalEntries: [],
        },
        'Recount: 7, not 10',
      );

      await correct(
        firstCorrection.id,
        {
          siteId,
          reportDate: '2026-10-08',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            {
              subcontractorId,
              siteContractId: contract.id,
              quantity: 12,
              clientGeneratedId: 'sub-cg-3',
            },
          ],
          labourEntries: [],
          wasteDisposalEntries: [],
        },
        'Recount again: 12, not 7',
      );

      const updatedContract = await prisma.siteContract.findUniqueOrThrow({
        where: { id: contract.id },
      });
      // 12 is the TRUE final quantity — a bug that deltas against the
      // first correction's own delta row (-3) would instead compute
      // 12 − (-3) = 15 for the second correction, totalling 10 − 3 + 15 = 22.
      expect(updatedContract.quantityCompleted.toString()).toBe('12');
    });

    // Review fix (finding #4): dropping (or unlinking) an already-
    // materialized entry from a correction's submission must be refused.
    it('correct(): refuses to drop an already-materialized Work Entry that is absent from the new submission', async () => {
      const contract = await createActiveContract();
      const original = await create({
        siteId,
        reportDate: '2026-10-09',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 4,
            clientGeneratedId: 'sub-cg-4',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      await expect(
        correct(
          original.id,
          {
            siteId,
            reportDate: '2026-10-09',
            workRecords: [],
            consumptions: [],
            rmcEntries: [],
            expenses: [],
            equipmentUsed: [],
            subcontractorEntries: [],
            labourEntries: [],
            wasteDisposalEntries: [],
          },
          'Forgot to restate the Work Entry',
        ),
      ).rejects.toThrow(BadRequestException);

      const corrections = await prisma.dailySiteReport.findMany({
        where: { correctsId: original.id },
      });
      expect(corrections).toHaveLength(0);
    });

    it('correct(): refuses when an already-materialized Work Entry is present but unlinked (siteContractId/quantity dropped)', async () => {
      const contract = await createActiveContract();
      const original = await create({
        siteId,
        reportDate: '2026-10-10',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 4,
            clientGeneratedId: 'sub-cg-5',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      await expect(
        correct(
          original.id,
          {
            siteId,
            reportDate: '2026-10-10',
            workRecords: [],
            consumptions: [],
            rmcEntries: [],
            expenses: [],
            equipmentUsed: [],
            subcontractorEntries: [
              {
                subcontractorId,
                workNote: 'Unlinked from the contract',
                clientGeneratedId: 'sub-cg-5',
              },
            ],
            labourEntries: [],
            wasteDisposalEntries: [],
          },
          'Accidentally unlinked the contract',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    // Review fix (finding #6): a DSR must not be able to materialize a Work
    // Entry against a Site Contract belonging to a different Site.
    it('rejects a Site Contract that belongs to a different Site than the DSR', async () => {
      const otherSite = await prisma.site.create({
        data: { name: 'Other Site', location: 'Elsewhere' },
      });
      const foreignContract = await prisma.siteContract.create({
        data: {
          subcontractorId,
          siteId: otherSite.id,
          status: 'ACTIVE',
          rateType: 'PER_TRIP',
          rateUnitLabel: 'trips',
        },
      });

      await expect(
        create({
          siteId,
          reportDate: '2026-10-11',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            {
              subcontractorId,
              siteContractId: foreignContract.id,
              quantity: 3,
            },
          ],
          labourEntries: [],
          wasteDisposalEntries: [],
        }),
      ).rejects.toThrow(BadRequestException);

      await prisma.siteContract.deleteMany({ where: { siteId: otherSite.id } });
      await prisma.site.deleteMany({ where: { id: otherSite.id } });
    });
  });

  // spec-dsr-activity-sync-detail-panel, goal 2.
  describe('findOne(): otherActivity rollup (client-readiness batch, goal 2)', () => {
    it("includes same-day activity recorded outside this DSR, and excludes this DSR's own materialized rows and itself", async () => {
      const contract = await prisma.siteContract.create({
        data: {
          subcontractorId,
          siteId,
          status: 'ACTIVE',
          rateType: 'PER_TRIP',
          rateUnitLabel: 'trips',
        },
      });
      const dsr = await create({
        siteId,
        reportDate: '2026-09-30',
        workRecords: [{ teamMemberId, attended: true }],
        consumptions: [{ materialSizeId, quantity: 5 }],
        rmcEntries: [
          { vendorId, quantityM3: 2, grade: 'M25', ratePerM3: 6000 },
        ],
        expenses: [{ categoryId, amount: 500 }],
        equipmentUsed: [],
        subcontractorEntries: [
          { subcontractorId, siteContractId: contract.id, quantity: 4 },
        ],
        labourEntries: [],
        wasteDisposalEntries: [
          { wasteType: 'Debris', ownership: 'OWN', tripCount: 2 },
        ],
      });

      const purchase = await prisma.purchase.create({
        data: {
          siteId,
          vendorId,
          materialSizeId,
          quantity: 50,
          destination: 'SITE',
          purchasedAt: new Date('2026-09-30'),
        },
      });

      const detail = await service.findOne(dsr.id);

      expect(detail.otherActivity.some((item) => item.id === purchase.id)).toBe(
        true,
      );
      expect(
        detail.otherActivity.some(
          (item) => item.type === 'DSR' && item.id === dsr.id,
        ),
      ).toBe(false);
      expect(
        detail.otherActivity.some((item) => item.type === 'CONSUMPTION'),
      ).toBe(false);
      expect(detail.otherActivity.some((item) => item.type === 'RMC')).toBe(
        false,
      );
      // Review fix (finding #13): the same exclusion must also cover the
      // record types the earlier version of this test didn't exercise.
      expect(
        detail.otherActivity.some((item) => item.type === 'WORK_RECORD'),
      ).toBe(false);
      expect(detail.otherActivity.some((item) => item.type === 'EXPENSE')).toBe(
        false,
      );
      expect(
        detail.otherActivity.some((item) => item.type === 'WASTE_DISPOSAL'),
      ).toBe(false);
      expect(
        detail.otherActivity.some((item) => item.type === 'WORK_ENTRY'),
      ).toBe(false);

      await prisma.purchase.deleteMany({ where: { id: purchase.id } });
    });

    // Review fix (finding #1): Waste Material/Subcontractor Work Entry
    // corrections are correctsId-chain DELTA rows meant to be summed with
    // their ancestors (unlike RMC/Consumption/Expense) — a corrected DSR's
    // PRE-correction row must not leak into otherActivity as if it were a
    // different, unrelated entry.
    it("excludes a corrected DSR's own pre-correction Waste Material and Subcontractor Work Entry rows from otherActivity", async () => {
      const contract = await prisma.siteContract.create({
        data: {
          subcontractorId,
          siteId,
          status: 'ACTIVE',
          rateType: 'PER_TRIP',
          rateUnitLabel: 'trips',
        },
      });
      const original = await create({
        siteId,
        reportDate: '2026-10-12',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [
          {
            subcontractorId,
            siteContractId: contract.id,
            quantity: 5,
            clientGeneratedId: 'other-activity-sub-1',
          },
        ],
        labourEntries: [],
        wasteDisposalEntries: [
          {
            wasteType: 'Debris',
            ownership: 'OWN',
            tripCount: 3,
            clientGeneratedId: 'other-activity-waste-1',
          },
        ],
      });
      const originalWasteId = original.wasteDisposalEntries[0]!.id;
      const originalWorkEntryId = original.subcontractorWorkEntries[0]!.id;

      const correction = await correct(
        original.id,
        {
          siteId,
          reportDate: '2026-10-12',
          workRecords: [],
          consumptions: [],
          rmcEntries: [],
          expenses: [],
          equipmentUsed: [],
          subcontractorEntries: [
            {
              subcontractorId,
              siteContractId: contract.id,
              quantity: 8,
              clientGeneratedId: 'other-activity-sub-1',
            },
          ],
          labourEntries: [],
          wasteDisposalEntries: [
            {
              wasteType: 'Debris',
              ownership: 'OWN',
              tripCount: 5,
              clientGeneratedId: 'other-activity-waste-1',
            },
          ],
        },
        'Recount',
      );

      const detail = await service.findOne(correction.id);

      expect(
        detail.otherActivity.some(
          (item) =>
            item.type === 'WASTE_DISPOSAL' && item.id === originalWasteId,
        ),
      ).toBe(false);
      expect(
        detail.otherActivity.some(
          (item) =>
            item.type === 'WORK_ENTRY' && item.id === originalWorkEntryId,
        ),
      ).toBe(false);
    });

    it('renders no otherActivity (empty array, no error) when nothing else was recorded that day', async () => {
      const dsr = await create({
        siteId,
        reportDate: '2026-10-01',
        workRecords: [],
        consumptions: [],
        rmcEntries: [],
        expenses: [],
        equipmentUsed: [],
        subcontractorEntries: [],
        labourEntries: [],
        wasteDisposalEntries: [],
      });

      const detail = await service.findOne(dsr.id);
      expect(detail.otherActivity).toEqual([]);
    });
  });
});
