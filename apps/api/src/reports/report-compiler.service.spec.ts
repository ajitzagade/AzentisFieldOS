import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_BRANDING,
  ReportCompilerService,
} from './report-compiler.service';
import type { DsrForCompile } from './report-compiler.service';

function makeService(
  overrides: {
    dsrFindMany?: ReturnType<typeof vi.fn>;
    brandingFindFirst?: ReturnType<typeof vi.fn>;
    dailyReportFindUnique?: ReturnType<typeof vi.fn>;
    dailyReportCreate?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const prisma = {
    dailySiteReport: {
      findMany: overrides.dsrFindMany ?? vi.fn().mockResolvedValue([]),
    },
    brandingConfig: {
      findFirst: overrides.brandingFindFirst ?? vi.fn().mockResolvedValue(null),
    },
    dailyReport: {
      findUnique:
        overrides.dailyReportFindUnique ?? vi.fn().mockResolvedValue(null),
      create:
        overrides.dailyReportCreate ??
        vi.fn().mockResolvedValue({ id: 'report1' }),
    },
    // compile() live-queries the same Site+date material activity buildContent
    // merges in (inventory→DSR sync fix) — empty by default here since these
    // tests aren't exercising that merge (see report-compiler.service.spec.ts's
    // buildContent tests above for that).
    purchase: { findMany: vi.fn().mockResolvedValue([]) },
    movement: { findMany: vi.fn().mockResolvedValue([]) },
    consumption: { findMany: vi.fn().mockResolvedValue([]) },
    rmcEntry: { findMany: vi.fn().mockResolvedValue([]) },
    wasteDisposal: { findMany: vi.fn().mockResolvedValue([]) },
    returnWastage: { findMany: vi.fn().mockResolvedValue([]) },
    expense: { findMany: vi.fn().mockResolvedValue([]) },
    subcontractorWorkEntry: { findMany: vi.fn().mockResolvedValue([]) },
  };
  const service = new ReportCompilerService(
    prisma as unknown as ConstructorParameters<typeof ReportCompilerService>[0],
  );
  return { service, prisma };
}

function makeDsr(overrides: Partial<DsrForCompile> = {}): DsrForCompile {
  return {
    id: 'dsr1',
    siteId: 'site1',
    reportDate: new Date('2026-08-11T00:00:00.000Z'),
    submittedByUserId: 'user1',
    workCompleted: 'Sub-base compaction — Ch. 4+200 to 4+450',
    workInProgress: null,
    plannedWork: null,
    issuesBlockers: null,
    safetyObservations: null,
    notes: null,
    createdAt: new Date('2026-08-11T12:00:00.000Z'),
    equipmentUsed: ['JCB 3DX'],
    correctsId: null,
    reason: null,
    site: { id: 'site1', name: 'NH-48 Highway Widening — Package 3' },
    workRecords: [{ attended: true }, { attended: true }, { attended: false }],
    consumptions: [
      {
        quantity: 40,
        materialSize: {
          label: 'OPC 53 Grade',
          material: { name: 'Cement', unit: { name: 'Bags' } },
        },
      },
    ],
    rmcEntries: [
      { grade: 'M25', quantityM3: 6 },
      { grade: 'M25', quantityM3: 6 },
    ],
    expenses: [{ amount: 18600 }],
    photos: [{ id: 'p1' }, { id: 'p2' }],
    ...overrides,
  } as unknown as DsrForCompile;
}

const branding = DEFAULT_BRANDING;

describe('ReportCompilerService.buildContent', () => {
  it('compiles a correct content payload from a DSR and its relations', () => {
    const { service } = makeService();

    const content = service.buildContent(makeDsr(), branding);

    expect(content.siteName).toBe('NH-48 Highway Widening — Package 3');
    expect(content.reportDate).toBe('11/Aug/2026');
    expect(content.branding).toEqual(branding);
    expect(content.work.completed).toBe(
      'Sub-base compaction — Ch. 4+200 to 4+450',
    );
    expect(content.labour).toEqual({ present: 2, total: 3 });
    expect(content.materials).toEqual([
      {
        material: 'Cement',
        size: 'OPC 53 Grade',
        quantity: 40,
        unit: 'Bags',
      },
    ]);
    expect(content.materialsReceived).toEqual([]);
    expect(content.rmc).toEqual({
      loads: 2,
      totalQuantityM3: 12,
      grades: ['M25'],
    });
    expect(content.equipmentUsed).toEqual(['JCB 3DX']);
    expect(content.expenses).toEqual({ total: 18600 });
    expect(content.photos).toEqual({ count: 2 });
  });

  it('merges live Purchase/Movement/standalone Consumption/RMC activity when provided (inventory→DSR sync fix)', () => {
    const { service } = makeService();

    const content = service.buildContent(makeDsr(), branding, {
      materialsReceived: [
        {
          id: 'purchase1',
          occurredAt: '2026-08-11T08:00:00.000Z',
          materialName: 'Steel',
          sizeLabel: '12mm',
          unitName: 'Kg',
          quantity: 200,
          amount: 14000,
          summary: 'from Shree Balaji Traders',
          source: 'PURCHASE',
          pending: false,
        },
      ],
      standaloneConsumptions: [
        {
          id: 'consumption1',
          occurredAt: '2026-08-11T09:00:00.000Z',
          materialName: 'Sand',
          sizeLabel: 'River sand',
          unitName: 'm3',
          quantity: 5,
          amount: null,
          summary: 'consumed on site',
        },
      ],
      standaloneRmcEntries: [
        {
          id: 'rmc1',
          occurredAt: '2026-08-11T10:00:00.000Z',
          vendorName: 'ABC RMC',
          grade: 'M30',
          quantityM3: 4,
          totalAmount: null,
        },
      ],
      standaloneWasteDisposals: [],
      standaloneWastageReturns: [],
      standaloneExpenses: [
        {
          id: 'expense1',
          occurredAt: '2026-08-11T11:00:00.000Z',
          categoryName: 'Fuel',
          description: 'Diesel top-up',
          amount: 500,
        },
      ],
      standaloneWorkEntries: [],
    });

    expect(content.materialsReceived).toEqual([
      {
        material: 'Steel',
        size: '12mm',
        quantity: 200,
        unit: 'Kg',
        pending: false,
      },
    ]);
    // The DSR-form consumption and the standalone one both appear — the
    // whole point of the fix (previously the standalone one was invisible).
    expect(content.materials).toEqual([
      { material: 'Cement', size: 'OPC 53 Grade', quantity: 40, unit: 'Bags' },
      { material: 'Sand', size: 'River sand', quantity: 5, unit: 'm3' },
    ]);
    expect(content.rmc).toEqual({
      loads: 3,
      totalQuantityM3: 16,
      grades: ['M25', 'M30'],
    });
    // Auto-sync Expenses (2026-09-22): the DSR-form expense (18600, from
    // makeDsr()'s own fixture) and the standalone one (500) both count —
    // the whole point being the Owner sees one true total for the day.
    expect(content.expenses).toEqual({ total: 19100 });
  });

  // Regression (2026-09-22): a real end-to-end run confirmed a Godown->Site
  // Movement's receipt at only 8 of the 10 Bags sent (SiteStock only ever
  // increments by the confirmed amount — movements.service.ts's
  // confirmReceipt), yet the report kept showing the original 10 forever,
  // permanently overstating what actually arrived at the Site. This asserts
  // buildContent passes through whatever quantity/pending
  // getSiteMaterialActivity already resolved (received once confirmed, sent
  // while still in transit) rather than re-deriving it.
  it('reflects a Movement´s actual (not sent) quantity once known, and flags one still awaiting confirmation', () => {
    const { service } = makeService();

    const content = service.buildContent(makeDsr(), branding, {
      materialsReceived: [
        {
          id: 'movement-confirmed',
          occurredAt: '2026-08-11T08:00:00.000Z',
          materialName: 'Cement',
          sizeLabel: '50kg',
          unitName: 'Bag',
          quantity: 8,
          amount: null,
          summary: 'Godown → Site',
          source: 'MOVEMENT',
          pending: false,
        },
        {
          id: 'movement-pending',
          occurredAt: '2026-08-11T09:00:00.000Z',
          materialName: 'Sand',
          sizeLabel: 'River sand',
          unitName: 'm3',
          quantity: 12,
          amount: null,
          summary: 'Godown → Site',
          source: 'MOVEMENT',
          pending: true,
        },
      ],
      standaloneConsumptions: [],
      standaloneRmcEntries: [],
      standaloneWasteDisposals: [],
      standaloneWastageReturns: [],
      standaloneExpenses: [],
      standaloneWorkEntries: [],
    });

    expect(content.materialsReceived).toEqual([
      {
        material: 'Cement',
        size: '50kg',
        quantity: 8,
        unit: 'Bag',
        pending: false,
      },
      {
        material: 'Sand',
        size: 'River sand',
        quantity: 12,
        unit: 'm3',
        pending: true,
      },
    ]);
  });

  it('handles Prisma Decimal values via toNumber()', () => {
    const { service } = makeService();
    const decimal = (n: number) => ({ toNumber: () => n });

    const content = service.buildContent(
      makeDsr({
        consumptions: [
          {
            quantity: decimal(320),
            materialSize: {
              label: '12mm',
              material: { name: 'TMT Steel', unit: { name: 'Kg' } },
            },
          },
        ],
        rmcEntries: [{ grade: 'M25', quantityM3: decimal(6) }],
        expenses: [{ amount: decimal(18600) }],
      } as unknown as Partial<DsrForCompile>),
      branding,
    );

    expect(content.materials[0]?.quantity).toBe(320);
    expect(content.rmc.totalQuantityM3).toBe(6);
    expect(content.expenses.total).toBe(18600);
  });
});

describe('ReportCompilerService.currentDsrsForDate (AC #4)', () => {
  it('returns nothing when no Site has a DSR for the day — so nothing compiles', async () => {
    const { service, prisma } = makeService({
      dsrFindMany: vi.fn().mockResolvedValue([]),
    });

    const result = await service.currentDsrsForDate(
      new Date('2026-08-11T00:00:00.000Z'),
    );

    expect(result).toEqual([]);
    expect(prisma.dailySiteReport.findMany).toHaveBeenCalled();
  });

  it('excludes a DSR that has since been corrected over (Story 3.5)', async () => {
    const original = makeDsr({ id: 'original', correctsId: null });
    const correction = makeDsr({ id: 'correction', correctsId: 'original' });
    const { service } = makeService({
      dsrFindMany: vi.fn().mockResolvedValue([correction, original]),
    });

    const result = await service.currentDsrsForDate(
      new Date('2026-08-11T00:00:00.000Z'),
    );

    expect(result.map((r) => r.id)).toEqual(['correction']);
  });

  it('never compiles a DRAFT into the delivered report — the query filters status:SUBMITTED (spec-dsr-drafts)', async () => {
    const dsrFindMany = vi.fn().mockResolvedValue([]);
    const { service } = makeService({ dsrFindMany });

    await service.currentDsrsForDate(new Date('2026-08-11T00:00:00.000Z'));

    // The official Daily Report is delivered to owners — a private DRAFT must
    // never leak into it. This assertion fails if the draft filter is dropped.
    expect(dsrFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SUBMITTED' }) as object,
      }),
    );
  });
});

describe('ReportCompilerService.compile', () => {
  it('is idempotent — returns the existing report without re-creating it', async () => {
    const create = vi.fn();
    const { service } = makeService({
      dailyReportFindUnique: vi.fn().mockResolvedValue({ id: 'existing' }),
      dailyReportCreate: create,
    });

    const result = await service.compile(makeDsr());

    expect(result).toEqual({ id: 'existing' });
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a DailyReport with the compiled content when none exists', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'report1' });
    const { service } = makeService({
      dailyReportFindUnique: vi.fn().mockResolvedValue(null),
      brandingFindFirst: vi.fn().mockResolvedValue(DEFAULT_BRANDING),
      dailyReportCreate: create,
    });

    await service.compile(makeDsr());

    expect(create).toHaveBeenCalledTimes(1);
    const call = create.mock.calls[0]?.[0] as {
      data: {
        siteId: string;
        dailySiteReportId: string;
        content: { siteName: string };
      };
    };
    expect(call.data.siteId).toBe('site1');
    expect(call.data.dailySiteReportId).toBe('dsr1');
    expect(call.data.content.siteName).toBe(
      'NH-48 Highway Widening — Package 3',
    );
  });
});
