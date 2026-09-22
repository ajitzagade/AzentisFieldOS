import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SUBMITTED_DSR_WHERE } from '../common/superseded-dsrs';
import { formatDate } from './format-date';
import {
  getSiteMaterialActivity,
  type SiteMaterialActivity,
} from '../sites/site-material-activity';

// Inventory→DSR sync fix (2026-09-21): a Purchase/Movement/standalone
// Consumption/RMC entry recorded outside the DSR form used to be completely
// absent from the compiled/emailed report — no query for them existed at
// all here. buildContent() stays a pure function (report-compiler.service.spec.ts
// exercises it directly with a fixture DSR and no DB) by taking the
// already-fetched activity as a parameter, defaulting to empty so existing
// callers/tests keep working unchanged.
const EMPTY_MATERIAL_ACTIVITY: SiteMaterialActivity = {
  materialsReceived: [],
  standaloneConsumptions: [],
  standaloneRmcEntries: [],
  standaloneWasteDisposals: [],
  standaloneWastageReturns: [],
  standaloneExpenses: [],
};

// Story 13.1 (FR-32): compiles a DailyReport's `content` payload from a
// DailySiteReport and its relations, plus the current BrandingConfig row.
// The payload is DENORMALIZED and stored at generation time — a historical
// report must keep reading exactly as delivered even if BrandingConfig or the
// underlying DSR data changes later (see schema comment on DailyReport).

export interface ReportBrandingSnapshot {
  tenantName: string;
  logoUrl: string | null;
  primaryColor: string;
}

export interface ReportContent {
  siteName: string;
  // Calendar day being reported, already formatted for display (DD/MMM/YYYY)
  // at compile time — senders (report-senders.ts) interpolate this straight
  // into the emailed HTML/subject, so it must never be a raw ISO string.
  reportDate: string;
  branding: ReportBrandingSnapshot;
  work: {
    completed: string | null;
    inProgress: string | null;
    planned: string | null;
    issuesBlockers: string | null;
    safetyObservations: string | null;
    notes: string | null;
  };
  labour: { present: number; total: number };
  materials: {
    material: string;
    size: string;
    quantity: number;
    unit: string;
  }[];
  // Inventory→DSR sync fix (2026-09-21): Purchases and inbound Movements —
  // the DSR form itself never had a "materials received" concept, so this
  // is always sourced from the live Site+date query, never the DSR form.
  materialsReceived: {
    material: string;
    size: string;
    quantity: number;
    unit: string;
    // A Movement not yet confirmed at the destination Site — see
    // MaterialsReceivedRow.pending in site-material-activity.ts.
    pending: boolean;
  }[];
  rmc: { loads: number; totalQuantityM3: number; grades: string[] };
  equipmentUsed: string[];
  expenses: { total: number };
  photos: { count: number };
}

// Neutral placeholder defaults, used only if the BrandingConfig singleton was
// never seeded (it always should be — infra/prisma/seed.ts). This is a
// data-layer default brand-color VALUE (it mirrors BrandingConfig's schema
// `@default` — the accent-teal-700 token value), not a UI style literal, so
// AD-4's no-hex-literal rule is deliberately suppressed on this one line.
// eslint-disable-next-line no-restricted-syntax -- data-layer neutral brand-color default, mirrors the BrandingConfig schema @default; not a UI style token
export const DEFAULT_PRIMARY_COLOR = '#0F5257';

export const DEFAULT_BRANDING: ReportBrandingSnapshot = {
  tenantName: 'Your Company',
  logoUrl: null,
  primaryColor: DEFAULT_PRIMARY_COLOR,
};

// The DSR shape the compiler needs: every relation the report summarizes.
const dsrCompileInclude = {
  site: true,
  workRecords: true,
  consumptions: {
    include: {
      materialSize: { include: { material: { include: { unit: true } } } },
    },
  },
  rmcEntries: true,
  expenses: true,
  photos: true,
} satisfies Prisma.DailySiteReportInclude;

export type DsrForCompile = Prisma.DailySiteReportGetPayload<{
  include: typeof dsrCompileInclude;
}>;

// Prisma Decimal | number | string | null -> number, robust for both real
// PrismaClient rows and plain unit-test fixtures.
function toNum(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  const maybeDecimal = value as { toNumber?: () => number };
  return typeof maybeDecimal.toNumber === 'function'
    ? maybeDecimal.toNumber()
    : Number(value);
}

@Injectable()
export class ReportCompilerService {
  constructor(private readonly prisma: PrismaService) {}

  // Every Site's current (uncorrected-over) DSR for the given date. A Site
  // with no DSR that day simply isn't in the result — so it produces no
  // report at all (AC #4), which is a normal state, not an error. Story 3.5:
  // a report that has since been corrected (a newer row with correctsId
  // pointing at it) is excluded, so we never compile a superseded DSR.
  async currentDsrsForDate(reportDate: Date): Promise<DsrForCompile[]> {
    const rows = await this.prisma.dailySiteReport.findMany({
      // spec-dsr-drafts: never compile a private DRAFT into a Daily Report.
      where: { reportDate, ...SUBMITTED_DSR_WHERE },
      include: dsrCompileInclude,
      orderBy: { createdAt: 'desc' },
    });
    const correctedIds = new Set(
      rows.map((r) => r.correctsId).filter((x): x is string => x !== null),
    );
    return rows.filter((r) => !correctedIds.has(r.id));
  }

  async getBrandingSnapshot(): Promise<ReportBrandingSnapshot> {
    const config = await this.prisma.brandingConfig.findFirst();
    if (!config) return DEFAULT_BRANDING;
    return {
      tenantName: config.tenantName,
      logoUrl: config.logoUrl,
      primaryColor: config.primaryColor,
    };
  }

  // Pure: builds the stored payload. No DB access, so it's exercised directly
  // by report-compiler.service.spec.ts with a fixture DSR.
  buildContent(
    dsr: DsrForCompile,
    branding: ReportBrandingSnapshot,
    materialActivity: SiteMaterialActivity = EMPTY_MATERIAL_ACTIVITY,
  ): ReportContent {
    const materials = [
      ...dsr.consumptions.map((consumption) => ({
        material: consumption.materialSize.material.name,
        size: consumption.materialSize.label,
        quantity: toNum(consumption.quantity),
        unit: consumption.materialSize.material.unit.name,
      })),
      ...materialActivity.standaloneConsumptions.map((c) => ({
        material: c.materialName,
        size: c.sizeLabel,
        quantity: c.quantity,
        unit: c.unitName,
      })),
    ];

    const materialsReceived = materialActivity.materialsReceived.map((m) => ({
      material: m.materialName,
      size: m.sizeLabel,
      quantity: m.quantity,
      unit: m.unitName,
      pending: m.pending,
    }));

    const grades = [
      ...new Set([
        ...dsr.rmcEntries.map((entry) => entry.grade),
        ...materialActivity.standaloneRmcEntries.map((entry) => entry.grade),
      ]),
    ];
    const rmc = {
      loads:
        dsr.rmcEntries.length + materialActivity.standaloneRmcEntries.length,
      totalQuantityM3:
        dsr.rmcEntries.reduce(
          (sum, entry) => sum + toNum(entry.quantityM3),
          0,
        ) +
        materialActivity.standaloneRmcEntries.reduce(
          (sum, entry) => sum + entry.quantityM3,
          0,
        ),
      grades,
    };

    const equipmentUsed = Array.isArray(dsr.equipmentUsed)
      ? (dsr.equipmentUsed as unknown[]).map((item) => String(item))
      : [];

    return {
      siteName: dsr.site.name,
      reportDate: formatDate(dsr.reportDate),
      branding,
      work: {
        completed: dsr.workCompleted,
        inProgress: dsr.workInProgress,
        planned: dsr.plannedWork,
        issuesBlockers: dsr.issuesBlockers,
        safetyObservations: dsr.safetyObservations,
        notes: dsr.notes,
      },
      labour: {
        present: dsr.workRecords.filter((record) => record.attended).length,
        total: dsr.workRecords.length,
      },
      materials,
      materialsReceived,
      rmc,
      equipmentUsed,
      expenses: {
        // Auto-sync Expenses (2026-09-22): a standalone Expense (the
        // /expenses module, not this DSR's own form) is folded into the
        // same total — the whole point being the Owner sees one true
        // figure for the day without the Supervisor re-entering it here.
        total:
          dsr.expenses.reduce((sum, expense) => sum + toNum(expense.amount), 0) +
          materialActivity.standaloneExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      },
      photos: { count: dsr.photos.length },
    };
  }

  // Idempotent: if a report already exists for this (siteId, reportDate) it is
  // returned unchanged — a re-run of the Cron never re-compiles with newer
  // branding/data (the denormalization guarantee).
  async compile(dsr: DsrForCompile) {
    const existing = await this.prisma.dailyReport.findUnique({
      where: {
        siteId_reportDate: { siteId: dsr.siteId, reportDate: dsr.reportDate },
      },
    });
    if (existing) return existing;

    const branding = await this.getBrandingSnapshot();
    const materialActivity = await getSiteMaterialActivity(
      this.prisma,
      dsr.siteId,
      dsr.reportDate,
    );
    const content = this.buildContent(dsr, branding, materialActivity);
    return this.prisma.dailyReport.create({
      data: {
        siteId: dsr.siteId,
        dailySiteReportId: dsr.id,
        reportDate: dsr.reportDate,
        content: content as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
