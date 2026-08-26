import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Story 13.1 (FR-32/FR-33): read side of the Reports surface — the "Recent
// Reports" delivery log and the single branded report's stored content.
// Stories 13.2–13.4 extend this controller/service with their filterable
// report views; this story owns only the DailyReport rows.

export interface ReportListFilters {
  siteId?: string;
  from?: string;
  to?: string;
}

function reportDateWhere(
  filters: ReportListFilters,
): Prisma.DailyReportWhereInput {
  const where: Prisma.DailyReportWhereInput = {};
  if (filters.siteId) where.siteId = filters.siteId;
  if (filters.from || filters.to) {
    const reportDate: { gte?: Date; lte?: Date } = {};
    if (filters.from) reportDate.gte = new Date(filters.from);
    if (filters.to) reportDate.lte = new Date(filters.to);
    where.reportDate = reportDate;
  }
  return where;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // The "Recent Reports" log: each DailyReport joined with its per-channel
  // ReportDelivery rows (one per channel), so the web layer can render the
  // Delivery Status badge. The heavy `content` payload is intentionally NOT
  // returned here — that's the detail read below.
  async listDaily(filters: ReportListFilters = {}) {
    const reports = await this.prisma.dailyReport.findMany({
      where: reportDateWhere(filters),
      include: {
        site: { select: { id: true, name: true } },
        deliveries: {
          select: {
            channel: true,
            status: true,
            attempts: true,
            lastError: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return reports.map((report) => ({
      id: report.id,
      reportType: 'Daily Site Report',
      siteId: report.siteId,
      siteName: report.site.name,
      reportDate: report.reportDate,
      generatedAt: report.generatedAt,
      deliveries: report.deliveries,
    }));
  }

  // The full stored `content` snapshot for the branded report-preview card —
  // reads exactly what was compiled/delivered, never re-derived from live DSR
  // data (the denormalization guarantee).
  async findDaily(id: string) {
    const report = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: {
        site: { select: { id: true, name: true } },
        deliveries: {
          select: {
            channel: true,
            status: true,
            attempts: true,
            lastError: true,
            deliveredAt: true,
          },
        },
      },
    });
    if (!report) {
      throw new NotFoundException(`Daily report ${id} not found`);
    }
    return report;
  }
}
