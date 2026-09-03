import { Injectable } from '@nestjs/common';
import type { SearchResponse } from '@azentisfieldos/shared';
import type { Role } from '../generated/prisma/client';
import { SitesService } from '../sites/sites.service';
import { MaterialsService } from '../materials/materials.service';
import { VendorsService } from '../vendors/vendors.service';
import { TeamMembersService } from '../team/team-members.service';
import { PaymentsService } from '../team/payments.service';
import { PurchasesService } from '../inventory/purchases.service';
import { SubcontractorsService } from '../subcontractors/subcontractors.service';
import { RmcService } from '../rmc/rmc.service';
import { ExpensesService } from '../expenses/expenses.service';
import { MovementsService } from '../inventory/movements.service';
import { ConsumptionService } from '../inventory/consumption.service';
import { WasteDisposalService } from '../waste-disposal/waste-disposal.service';
import { ReturnWastageService } from '../inventory/return-wastage.service';
import { AdvancesService } from '../team/advances.service';
import { AdvanceAdjustmentsService } from '../team/advance-adjustments.service';
import { MachineryService } from '../assets/machinery.service';
import { VehicleService } from '../assets/vehicle.service';
import { SiteContractsService } from '../subcontractors/site-contracts.service';
import { WorkEntriesService } from '../subcontractors/work-entries.service';
import { SubcontractorPaymentsService } from '../subcontractors/subcontractor-payments.service';
import { WorkRecordsService } from '../team/work-records.service';
import { DsrService } from '../dsr/dsr.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { supersededDsrIds } from '../common/superseded-dsrs';
import { rankByQuery } from './rank-by-query';

// How many results per group are shown inline — beyond this, the client
// shows a "See all N results" action instead of growing the popup
// (AC #4/#5: search never becomes a second, unbounded list).
const INLINE_LIMIT = 5;

const EMPTY_GROUP = { results: [], total: 0 };
const EMPTY_CANDIDATES = { candidates: [], total: 0 };

// Story 16.5: the only two groups genuinely read-restricted at their own
// endpoint today (SubcontractorPaymentsController's class-level
// @Roles('OWNER_ADMIN'), AuditController.list()'s method-level one). Every
// other entity's list/findOne is open to any authenticated user, so search
// must not restrict it further — see each service's searchCandidates()
// comment for the specific citation.
const OWNER_ONLY_ROLES: Role[] = ['OWNER_ADMIN'];

function canSeeGatedGroup(role: Role): boolean {
  return OWNER_ONLY_ROLES.includes(role);
}

// Story 16.2 (Sites/Materials) + Story 19.2 (Vendors, Team Members,
// Payments, Purchases, Subcontractors, RMC, Expenses) + Story 16.6
// (Movements, Consumption, Waste Disposal, Advances, Advance Adjustments,
// Machinery, Vehicles, Site Contracts, Subcontractor Work Entries,
// Subcontractor Payments, Work Records, Daily Reports, Audit Log): one
// endpoint searching across every globally-searchable entity. A blank (or
// sub-2-character) query never hits the database (AC #6 — the empty search
// box shows nothing, never a spinner with nothing to load).
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
    private readonly movements: MovementsService,
    private readonly consumption: ConsumptionService,
    private readonly wasteDisposal: WasteDisposalService,
    private readonly returnWastage: ReturnWastageService,
    private readonly advances: AdvancesService,
    private readonly advanceAdjustments: AdvanceAdjustmentsService,
    private readonly machinery: MachineryService,
    private readonly vehicles: VehicleService,
    private readonly siteContracts: SiteContractsService,
    private readonly workEntries: WorkEntriesService,
    private readonly subcontractorPayments: SubcontractorPaymentsService,
    private readonly workRecords: WorkRecordsService,
    private readonly dsr: DsrService,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async search(q: string, role: Role): Promise<SearchResponse> {
    const query = q?.trim() ?? '';
    // A 1-character query is too broad to be useful and needlessly fires a
    // DB round-trip per entity on every keystroke — same threshold enforced
    // client-side in use-global-search.ts. Count code points, not UTF-16
    // code units — `.length` alone would let a single astral-plane
    // character (most emoji) through, since its UTF-16 encoding is a
    // 2-unit surrogate pair.
    if ([...query].length < 2) {
      return {
        sites: EMPTY_GROUP,
        materials: EMPTY_GROUP,
        vendors: EMPTY_GROUP,
        teamMembers: EMPTY_GROUP,
        payments: EMPTY_GROUP,
        purchases: EMPTY_GROUP,
        subcontractors: EMPTY_GROUP,
        rmc: EMPTY_GROUP,
        expenses: EMPTY_GROUP,
        movements: EMPTY_GROUP,
        consumptions: EMPTY_GROUP,
        wasteDisposals: EMPTY_GROUP,
        returnWastages: EMPTY_GROUP,
        advances: EMPTY_GROUP,
        advanceAdjustments: EMPTY_GROUP,
        machinery: EMPTY_GROUP,
        vehicles: EMPTY_GROUP,
        siteContracts: EMPTY_GROUP,
        workEntries: EMPTY_GROUP,
        subcontractorPayments: EMPTY_GROUP,
        workRecords: EMPTY_GROUP,
        dailyReports: EMPTY_GROUP,
        auditLogs: EMPTY_GROUP,
      };
    }

    // Gated groups skip the DB call entirely when the role can't see them —
    // cheaper than querying and discarding, and defense-in-depth alongside
    // the role check applied below.
    const canSeeGated = canSeeGatedGroup(role);

    // Kicked off now, not awaited yet, and shared with Consumption/
    // WorkRecords/Dsr below via `.then()` (not a blocking `await` here) —
    // each independently needs "every corrected DSR in the tenant" to
    // exclude superseded rows, and recomputing that unbounded scan 3x
    // concurrently on every keystroke would be wasteful. `.then()` keeps
    // this promise racing alongside the other 20 unrelated entity queries
    // in the Promise.allSettled below, rather than serializing it in front
    // of the whole batch the way an `await` here would.
    const superseded = supersededDsrIds(this.prisma);

    // One group's failure (e.g. a slow/erroring query) must not blank out a
    // group that succeeded — Promise.allSettled isolates each entity's
    // search, falling back to an empty group rather than failing the whole
    // response.
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
      movementSettled,
      consumptionSettled,
      wasteDisposalSettled,
      returnWastageSettled,
      advanceSettled,
      advanceAdjustmentSettled,
      machinerySettled,
      vehicleSettled,
      siteContractSettled,
      workEntrySettled,
      subcontractorPaymentSettled,
      workRecordSettled,
      dsrSettled,
      auditSettled,
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
      this.movements.searchCandidates(query),
      superseded.then((ids) => this.consumption.searchCandidates(query, ids)),
      this.wasteDisposal.searchCandidates(query),
      this.returnWastage.searchCandidates(query),
      this.advances.searchCandidates(query),
      this.advanceAdjustments.searchCandidates(query),
      this.machinery.searchCandidates(query),
      this.vehicles.searchCandidates(query),
      this.siteContracts.searchCandidates(query),
      this.workEntries.searchCandidates(query),
      canSeeGated
        ? this.subcontractorPayments.searchCandidates(query)
        : Promise.resolve(EMPTY_CANDIDATES),
      superseded.then((ids) => this.workRecords.searchCandidates(query, ids)),
      superseded.then((ids) => this.dsr.searchCandidates(query, ids)),
      canSeeGated
        ? this.audit.searchCandidates(query)
        : Promise.resolve(EMPTY_CANDIDATES),
    ]);

    function settledOr<T>(
      settled: PromiseSettledResult<{ candidates: T[]; total: number }>,
    ): { candidates: T[]; total: number } {
      return settled.status === 'fulfilled' ? settled.value : EMPTY_CANDIDATES;
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
    const movementResult = settledOr(movementSettled);
    const consumptionResult = settledOr(consumptionSettled);
    const wasteDisposalResult = settledOr(wasteDisposalSettled);
    const returnWastageResult = settledOr(returnWastageSettled);
    const advanceResult = settledOr(advanceSettled);
    const advanceAdjustmentResult = settledOr(advanceAdjustmentSettled);
    const machineryResult = settledOr(machinerySettled);
    const vehicleResult = settledOr(vehicleSettled);
    const siteContractResult = settledOr(siteContractSettled);
    const workEntryResult = settledOr(workEntrySettled);
    const subcontractorPaymentResult = settledOr(subcontractorPaymentSettled);
    const workRecordResult = settledOr(workRecordSettled);
    const dsrResult = settledOr(dsrSettled);
    const auditResult = settledOr(auditSettled);

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
    const rankedMovements = rankByQuery(
      movementResult.candidates,
      query,
      (movement) => [
        movement.materialSize.material.name,
        movement.sourceSite?.name ?? '',
        movement.destinationSite.name,
        movement.notes ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedConsumptions = rankByQuery(
      consumptionResult.candidates,
      query,
      (consumption) => [
        consumption.materialSize.material.name,
        consumption.site.name,
        consumption.activityReference ?? '',
        consumption.notes ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedWasteDisposals = rankByQuery(
      wasteDisposalResult.candidates,
      query,
      (disposal) => [
        disposal.wasteType,
        disposal.site.name,
        disposal.vendor?.name ?? '',
        disposal.notes ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedReturnWastages = rankByQuery(
      returnWastageResult.candidates,
      query,
      (entry) => [
        entry.materialSize.material.name,
        entry.site.name,
        entry.notes ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedAdvances = rankByQuery(
      advanceResult.candidates,
      query,
      (advance) => [advance.teamMember.name, advance.reason ?? ''],
    ).slice(0, INLINE_LIMIT);
    const rankedAdvanceAdjustments = rankByQuery(
      advanceAdjustmentResult.candidates,
      query,
      (adjustment) => [
        adjustment.advance.teamMember.name,
        adjustment.note ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedMachinery = rankByQuery(
      machineryResult.candidates,
      query,
      (machine) => [
        machine.name,
        machine.assetNumber,
        machine.operator ?? '',
        machine.type.name,
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedVehicles = rankByQuery(
      vehicleResult.candidates,
      query,
      (vehicle) => [vehicle.number, vehicle.driver ?? '', vehicle.type.name],
    ).slice(0, INLINE_LIMIT);
    const rankedSiteContracts = rankByQuery(
      siteContractResult.candidates,
      query,
      (contract) => [
        contract.subcontractor.name,
        contract.site.name,
        contract.workCategory ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedWorkEntries = rankByQuery(
      workEntryResult.candidates,
      query,
      (entry) => [
        entry.siteContract.subcontractor.name,
        entry.siteContract.site.name,
        entry.note ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedSubcontractorPayments = rankByQuery(
      subcontractorPaymentResult.candidates,
      query,
      (payment) => [
        payment.siteContract.subcontractor.name,
        payment.siteContract.site.name,
        payment.note ?? '',
      ],
    ).slice(0, INLINE_LIMIT);
    const rankedWorkRecords = rankByQuery(
      workRecordResult.candidates,
      query,
      (record) => [record.teamMember.name, record.site.name],
    ).slice(0, INLINE_LIMIT);
    const rankedDsr = rankByQuery(dsrResult.candidates, query, (report) => [
      report.site.name,
      report.submittedBy.name,
      report.workCompleted ?? '',
      report.workInProgress ?? '',
      report.plannedWork ?? '',
      report.issuesBlockers ?? '',
      report.safetyObservations ?? '',
      report.notes ?? '',
    ]).slice(0, INLINE_LIMIT);
    const rankedAudit = rankByQuery(auditResult.candidates, query, (log) => [
      log.action,
      log.entityType ?? '',
      log.user.name,
    ]).slice(0, INLINE_LIMIT);

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
      movements: {
        results: rankedMovements.map((movement) => ({
          id: movement.id,
          materialName: movement.materialSize.material.name,
          sourceSiteName: movement.sourceSite?.name ?? null,
          destinationSiteName: movement.destinationSite.name,
        })),
        total: movementResult.total,
      },
      consumptions: {
        results: rankedConsumptions.map((consumption) => ({
          id: consumption.id,
          materialName: consumption.materialSize.material.name,
          siteName: consumption.site.name,
        })),
        total: consumptionResult.total,
      },
      wasteDisposals: {
        results: rankedWasteDisposals.map((disposal) => ({
          id: disposal.id,
          wasteType: disposal.wasteType,
          siteName: disposal.site.name,
          vendorName: disposal.vendor?.name ?? null,
        })),
        total: wasteDisposalResult.total,
      },
      returnWastages: {
        results: rankedReturnWastages.map((entry) => ({
          id: entry.id,
          kind: entry.kind,
          materialName: entry.materialSize.material.name,
          siteName: entry.site.name,
        })),
        total: returnWastageResult.total,
      },
      advances: {
        results: rankedAdvances.map((advance) => ({
          id: advance.id,
          teamMemberId: advance.teamMemberId,
          teamMemberName: advance.teamMember.name,
          amount: advance.amount.toNumber(),
        })),
        total: advanceResult.total,
      },
      advanceAdjustments: {
        results: rankedAdvanceAdjustments.map((adjustment) => ({
          id: adjustment.id,
          teamMemberId: adjustment.advance.teamMemberId,
          advanceId: adjustment.advanceId,
          teamMemberName: adjustment.advance.teamMember.name,
          amount: adjustment.amount.toNumber(),
        })),
        total: advanceAdjustmentResult.total,
      },
      machinery: {
        results: rankedMachinery.map((machine) => ({
          id: machine.id,
          name: machine.name,
          assetNumber: machine.assetNumber,
          typeName: machine.type.name,
          currentSiteName: machine.currentSite?.name ?? null,
        })),
        total: machineryResult.total,
      },
      vehicles: {
        results: rankedVehicles.map((vehicle) => ({
          id: vehicle.id,
          number: vehicle.number,
          typeName: vehicle.type.name,
          currentSiteName: vehicle.currentSite?.name ?? null,
        })),
        total: vehicleResult.total,
      },
      siteContracts: {
        results: rankedSiteContracts.map((contract) => ({
          id: contract.id,
          siteId: contract.siteId,
          subcontractorName: contract.subcontractor.name,
          siteName: contract.site.name,
          status: contract.status,
        })),
        total: siteContractResult.total,
      },
      workEntries: {
        results: rankedWorkEntries.map((entry) => ({
          id: entry.id,
          siteId: entry.siteContract.siteId,
          siteContractId: entry.siteContractId,
          subcontractorName: entry.siteContract.subcontractor.name,
          siteName: entry.siteContract.site.name,
        })),
        total: workEntryResult.total,
      },
      subcontractorPayments: {
        results: rankedSubcontractorPayments.map((payment) => ({
          id: payment.id,
          siteId: payment.siteContract.siteId,
          siteContractId: payment.siteContractId,
          subcontractorName: payment.siteContract.subcontractor.name,
          siteName: payment.siteContract.site.name,
          amount: payment.amount.toNumber(),
        })),
        total: subcontractorPaymentResult.total,
      },
      workRecords: {
        results: rankedWorkRecords.map((record) => ({
          id: record.id,
          teamMemberId: record.teamMemberId,
          teamMemberName: record.teamMember.name,
          siteName: record.site.name,
        })),
        total: workRecordResult.total,
      },
      dailyReports: {
        results: rankedDsr.map((report) => ({
          id: report.id,
          siteName: report.site.name,
          submittedByName: report.submittedBy.name,
        })),
        total: dsrResult.total,
      },
      auditLogs: {
        results: rankedAudit.map((log) => ({
          id: log.id,
          action: log.action,
          userId: log.userId,
          userName: log.user.name,
        })),
        total: auditResult.total,
      },
    };
  }
}
