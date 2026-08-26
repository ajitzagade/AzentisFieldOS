import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
  // Calendar day being reported, YYYY-MM-DD.
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
      where: { reportDate },
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
  ): ReportContent {
    const materials = dsr.consumptions.map((consumption) => ({
      material: consumption.materialSize.material.name,
      size: consumption.materialSize.label,
      quantity: toNum(consumption.quantity),
      unit: consumption.materialSize.material.unit.name,
    }));

    const grades = [...new Set(dsr.rmcEntries.map((entry) => entry.grade))];
    const rmc = {
      loads: dsr.rmcEntries.length,
      totalQuantityM3: dsr.rmcEntries.reduce(
        (sum, entry) => sum + toNum(entry.quantityM3),
        0,
      ),
      grades,
    };

    const equipmentUsed = Array.isArray(dsr.equipmentUsed)
      ? (dsr.equipmentUsed as unknown[]).map((item) => String(item))
      : [];

    return {
      siteName: dsr.site.name,
      reportDate: dsr.reportDate.toISOString().slice(0, 10),
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
      rmc,
      equipmentUsed,
      expenses: {
        total: dsr.expenses.reduce(
          (sum, expense) => sum + toNum(expense.amount),
          0,
        ),
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
    const content = this.buildContent(dsr, branding);
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
