import { Injectable, NotFoundException } from '@nestjs/common';
import type { FinancialReportFilters } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';

// Story 13.4 (FR-46): the Financial report view — five cost categories, each a
// direct SUM() over its owning table within the date window, composed here.
// This is a read-only aggregation layer: it re-derives none of the owning
// epics' business logic, it only sums their money columns.
//
// AD-1: there is NO tenantId / current-tenant filter anywhere in this layer,
// and adding one would be a defect. A deployment's database belongs to exactly
// one Tenant, so every row these SUMs can reach already belongs to this Tenant
// by construction — AC #2's per-Contractor rollup is "across every Site", i.e.
// the whole (single-Tenant) database, satisfied by that absence, not a filter.
//
// STRUCTURAL BOUNDARY (Dev Notes): two of the five categories are
// Contractor-level ONLY, by the data model's own shape, not a missed filter:
//   - `labour` (SUM Payment.netPayable): Payment has no siteId — a Team Member
//     is not bound to a Site (FR-19), so a Payment can't be attributed to one.
//   - `machineryVehicle` (SUM MachineryServiceLog.cost + VehicleServiceLog.cost):
//     service logs have no siteId — an asset's service history belongs to the
//     asset, not to wherever it happened to be that day (Epic 8).
// These therefore appear only in `contractorTotal`; per-Site rows carry them as
// `null`, NEVER a fabricated `0` (which would read as "no labour cost at this
// Site" — false — instead of "labour cost isn't attributable to a Site at all"
// — true). A Godown-destined Purchase (siteId = null) is likewise a
// Contractor-only material cost until it moves to a Site, so it counts toward
// `contractorTotal.material` but toward no `bySite` row.

interface DecimalLike {
  toNumber(): number;
}

// A Prisma _sum aggregate value → number, coercing null (no matching rows) to
// 0 — the same `?.toNumber() ?? 0` discipline the RMC/Expense stats use.
function toNum(value: DecimalLike | null | undefined): number {
  return value?.toNumber() ?? 0;
}

export interface FinancialSiteRow {
  siteId: string;
  name: string;
  material: number;
  // Structurally not attributable to a Site (see class note) — always null in a
  // per-Site row, so the UI reads "not tracked per-Site", not "₹0 spent here".
  labour: null;
  rmc: number;
  machineryVehicle: null;
  expenses: number;
  // Sum of only the categories a Site row actually has: material + rmc +
  // expenses (AC #1 reconciles within a row's own available categories).
  total: number;
}

export interface FinancialContractorTotal {
  material: number;
  labour: number;
  rmc: number;
  machineryVehicle: number;
  expenses: number;
  total: number;
}

export interface FinancialReport {
  bySite: FinancialSiteRow[];
  contractorTotal: FinancialContractorTotal;
}

@Injectable()
export class FinancialReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // FR-46: the per-Site and per-Contractor cost breakdown. `contractorTotal` is
  // always Contractor-wide (every Site's data plus the Site-less
  // labour/machinery/Godown-material figures); the optional `siteId` narrows
  // only which `bySite` rows are returned.
  async getFinancialReport(
    filters: FinancialReportFilters,
  ): Promise<FinancialReport> {
    const { siteId, from, to } = filters;
    const bounds = dateRangeBounds(from, to);

    // Each SUM lives in Postgres (exact Decimal arithmetic); we only add the
    // handful of already-summed category totals in JS, the same way the Expense
    // / RMC / Vendor stats compose their aggregates — no float drift introduced.
    const [
      materialGroups,
      labourAgg,
      rmcGroups,
      machineryAgg,
      vehicleAgg,
      expenseGroups,
    ] = await Promise.all([
      this.prisma.purchase.groupBy({
        by: ['siteId'],
        where: { purchasedAt: bounds },
        _sum: { totalAmount: true },
      }),
      this.prisma.payment.aggregate({
        where: { createdAt: bounds },
        _sum: { netPayable: true },
      }),
      this.prisma.rmcEntry.groupBy({
        by: ['siteId'],
        where: { deliveredAt: bounds },
        _sum: { totalAmount: true },
      }),
      this.prisma.machineryServiceLog.aggregate({
        where: { serviceDate: bounds },
        _sum: { cost: true },
      }),
      this.prisma.vehicleServiceLog.aggregate({
        where: { serviceDate: bounds },
        _sum: { cost: true },
      }),
      this.prisma.expense.groupBy({
        by: ['siteId'],
        where: { incurredAt: bounds },
        _sum: { amount: true },
      }),
    ]);

    // ---- Contractor-only categories (no siteId exists on these tables) ----
    const labour = toNum(labourAgg._sum.netPayable);
    const machineryVehicle =
      toNum(machineryAgg._sum.cost) + toNum(vehicleAgg._sum.cost);

    // A Godown-destined Purchase (siteId = null) is a Contractor-only material
    // cost — its SUM is kept out of every per-Site row and added only to the
    // Contractor material total.
    let godownMaterial = 0;
    const materialBySite = new Map<string, number>();
    for (const group of materialGroups) {
      const amount = toNum(group._sum.totalAmount);
      if (group.siteId === null) {
        godownMaterial += amount;
      } else {
        materialBySite.set(group.siteId, amount);
      }
    }

    // RMC and Expense are always Site-tagged (schema: siteId is required), so
    // every group here has a non-null siteId.
    const rmcBySite = new Map<string, number>();
    for (const group of rmcGroups) {
      if (group.siteId !== null) {
        rmcBySite.set(group.siteId, toNum(group._sum.totalAmount));
      }
    }
    const expensesBySite = new Map<string, number>();
    for (const group of expenseGroups) {
      if (group.siteId !== null) {
        expensesBySite.set(group.siteId, toNum(group._sum.amount));
      }
    }

    // ---- Contractor totals (across every Site) ----
    const siteMaterialTotal = sumValues(materialBySite);
    const rmcTotal = sumValues(rmcBySite);
    const expensesTotal = sumValues(expensesBySite);
    const materialTotal = siteMaterialTotal + godownMaterial;
    const contractorTotal: FinancialContractorTotal = {
      material: materialTotal,
      labour,
      rmc: rmcTotal,
      machineryVehicle,
      expenses: expensesTotal,
      total:
        materialTotal + labour + rmcTotal + machineryVehicle + expensesTotal,
    };

    // ---- Per-Site rows (only the three genuinely Site-tagged categories) ----
    const siteIds = new Set<string>([
      ...materialBySite.keys(),
      ...rmcBySite.keys(),
      ...expensesBySite.keys(),
    ]);
    const names = await this.siteNames([...siteIds]);
    const buildRow = (id: string, name: string): FinancialSiteRow => {
      const material = materialBySite.get(id) ?? 0;
      const rmc = rmcBySite.get(id) ?? 0;
      const expenses = expensesBySite.get(id) ?? 0;
      return {
        siteId: id,
        name,
        material,
        labour: null,
        rmc,
        machineryVehicle: null,
        expenses,
        total: material + rmc + expenses,
      };
    };

    let bySite: FinancialSiteRow[];
    if (siteId) {
      // Narrow to the selected Site. If it has costs it's already computed;
      // otherwise present an honest zero row (0 is a truthful per-Site material/
      // rmc/expenses figure — the fabricated-zero prohibition is only for the
      // two Contractor-only categories, which stay null). A non-existent Site
      // 404s, mirroring the Site report.
      const name = names.get(siteId) ?? (await this.requireSiteName(siteId));
      bySite = [buildRow(siteId, name)];
    } else {
      bySite = [...siteIds]
        .map((id) => buildRow(id, names.get(id) ?? id))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    return { bySite, contractorTotal };
  }

  private async siteNames(ids: string[]): Promise<Map<string, string>> {
    if (ids.length === 0) {
      return new Map();
    }
    const sites = await this.prisma.site.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
    return new Map(sites.map((site) => [site.id, site.name]));
  }

  private async requireSiteName(siteId: string): Promise<string> {
    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { name: true },
    });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }
    return site.name;
  }
}

function sumValues(map: Map<string, number>): number {
  let total = 0;
  for (const value of map.values()) {
    total += value;
  }
  return total;
}
