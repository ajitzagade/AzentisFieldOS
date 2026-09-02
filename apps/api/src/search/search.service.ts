import { Injectable } from '@nestjs/common';
import type { SearchResponse } from '@azentisfieldos/shared';
import { SitesService } from '../sites/sites.service';
import { MaterialsService } from '../materials/materials.service';
import { VendorsService } from '../vendors/vendors.service';
import { TeamMembersService } from '../team/team-members.service';
import { PaymentsService } from '../team/payments.service';
import { PurchasesService } from '../inventory/purchases.service';
import { SubcontractorsService } from '../subcontractors/subcontractors.service';
import { RmcService } from '../rmc/rmc.service';
import { ExpensesService } from '../expenses/expenses.service';
import { rankByQuery } from './rank-by-query';

// How many results per group are shown inline — beyond this, the client
// shows a "See all N results" action instead of growing the popup
// (AC #4/#5: search never becomes a second, unbounded list).
const INLINE_LIMIT = 5;

// Story 16.2 (Sites/Materials) + Story 19.2 (Vendors, Team Members,
// Payments, Purchases, Subcontractors, RMC, Expenses): one endpoint
// searching across every globally-searchable entity. A blank query never
// hits the database (AC #6 — the empty search box shows nothing, never a
// spinner with nothing to load).
@Injectable()
export class SearchService {
  constructor(
    private readonly sites: SitesService,
    private readonly materials: MaterialsService,
    private readonly vendors: VendorsService,
    private readonly teamMembers: TeamMembersService,
    private readonly payments: PaymentsService,
    private readonly purchases: PurchasesService,
    private readonly subcontractors: SubcontractorsService,
    private readonly rmc: RmcService,
    private readonly expenses: ExpensesService,
  ) {}

  async search(q: string): Promise<SearchResponse> {
    const query = q?.trim() ?? '';
    if (!query) {
      const empty = { results: [], total: 0 };
      return {
        sites: empty,
        materials: empty,
        vendors: empty,
        teamMembers: empty,
        payments: empty,
        purchases: empty,
        subcontractors: empty,
        rmc: empty,
        expenses: empty,
      };
    }

    // One group's failure (e.g. a slow/erroring query) must not blank out a
    // group that succeeded — Promise.allSettled isolates each entity's
    // search, falling back to an empty group rather than failing the whole
    // response.
    const emptyGroup = { candidates: [], total: 0 };
    const [
      siteSettled,
      materialSettled,
      vendorSettled,
      teamMemberSettled,
      paymentSettled,
      purchaseSettled,
      subcontractorSettled,
      rmcSettled,
      expenseSettled,
    ] = await Promise.allSettled([
      this.sites.searchCandidates(query),
      this.materials.searchCandidates(query),
      this.vendors.searchCandidates(query),
      this.teamMembers.searchCandidates(query),
      this.payments.searchCandidates(query),
      this.purchases.searchCandidates(query),
      this.subcontractors.searchCandidates(query),
      this.rmc.searchCandidates(query),
      this.expenses.searchCandidates(query),
    ]);

    function settledOr<T>(
      settled: PromiseSettledResult<{ candidates: T[]; total: number }>,
    ): { candidates: T[]; total: number } {
      return settled.status === 'fulfilled' ? settled.value : emptyGroup;
    }

    const siteResult = settledOr(siteSettled);
    const materialResult = settledOr(materialSettled);
    const vendorResult = settledOr(vendorSettled);
    const teamMemberResult = settledOr(teamMemberSettled);
    const paymentResult = settledOr(paymentSettled);
    const purchaseResult = settledOr(purchaseSettled);
    const subcontractorResult = settledOr(subcontractorSettled);
    const rmcResult = settledOr(rmcSettled);
    const expenseResult = settledOr(expenseSettled);

    const rankedSites = rankByQuery(siteResult.candidates, query, (site) => [
      site.name,
      site.location,
      site.contractReference ?? '',
    ]).slice(0, INLINE_LIMIT);
    const rankedMaterials = rankByQuery(
      materialResult.candidates,
      query,
      (material) => material.name,
    ).slice(0, INLINE_LIMIT);
    const rankedVendors = rankByQuery(
      vendorResult.candidates,
      query,
      (vendor) => [vendor.name, vendor.contactPerson ?? '', vendor.phone ?? ''],
    ).slice(0, INLINE_LIMIT);
    const rankedTeamMembers = rankByQuery(
      teamMemberResult.candidates,
      query,
      (member) => [member.name, member.designation ?? ''],
    ).slice(0, INLINE_LIMIT);
    const rankedPayments = rankByQuery(
      paymentResult.candidates,
      query,
      (payment) => [payment.teamMember.name, payment.payPeriod ?? ''],
    ).slice(0, INLINE_LIMIT);
    const rankedPurchases = rankByQuery(
      purchaseResult.candidates,
      query,
      (purchase) => [
        purchase.vendor.name,
        purchase.materialSize.material.name,
        purchase.invoiceOrChallanNo ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedSubcontractors = rankByQuery(
      subcontractorResult.candidates,
      query,
      (sub) => [sub.name, sub.contactPerson ?? '', sub.phone ?? ''],
    ).slice(0, INLINE_LIMIT);
    const rankedRmc = rankByQuery(rmcResult.candidates, query, (entry) => [
      entry.grade,
      entry.site.name,
      entry.vendor.name,
    ]).slice(0, INLINE_LIMIT);
    const rankedExpenses = rankByQuery(
      expenseResult.candidates,
      query,
      (expense) => [expense.description ?? '', expense.personOrVendor ?? ''],
    ).slice(0, INLINE_LIMIT);

    return {
      sites: {
        results: rankedSites.map((site) => ({
          id: site.id,
          name: site.name,
          location: site.location,
          contractReference: site.contractReference,
        })),
        total: siteResult.total,
      },
      materials: {
        results: rankedMaterials.map((material) => ({
          id: material.id,
          name: material.name,
          category: { id: material.category.id, name: material.category.name },
        })),
        total: materialResult.total,
      },
      vendors: {
        results: rankedVendors.map((vendor) => ({
          id: vendor.id,
          name: vendor.name,
          contactPerson: vendor.contactPerson,
          phone: vendor.phone,
        })),
        total: vendorResult.total,
      },
      teamMembers: {
        results: rankedTeamMembers.map((member) => ({
          id: member.id,
          name: member.name,
          designation: member.designation,
        })),
        total: teamMemberResult.total,
      },
      payments: {
        results: rankedPayments.map((payment) => ({
          id: payment.id,
          teamMemberName: payment.teamMember.name,
          payPeriod: payment.payPeriod,
          netPayable: payment.netPayable.toNumber(),
        })),
        total: paymentResult.total,
      },
      purchases: {
        results: rankedPurchases.map((purchase) => ({
          id: purchase.id,
          vendorName: purchase.vendor.name,
          materialName: purchase.materialSize.material.name,
          totalAmount: purchase.totalAmount?.toNumber() ?? null,
        })),
        total: purchaseResult.total,
      },
      subcontractors: {
        results: rankedSubcontractors.map((sub) => ({
          id: sub.id,
          name: sub.name,
          contactPerson: sub.contactPerson,
          phone: sub.phone,
        })),
        total: subcontractorResult.total,
      },
      rmc: {
        results: rankedRmc.map((entry) => ({
          id: entry.id,
          grade: entry.grade,
          siteName: entry.site.name,
          vendorName: entry.vendor.name,
        })),
        total: rmcResult.total,
      },
      expenses: {
        results: rankedExpenses.map((expense) => ({
          id: expense.id,
          description: expense.description,
          siteName: expense.site.name,
          amount: expense.amount.toNumber(),
        })),
        total: expenseResult.total,
      },
    };
  }
}
