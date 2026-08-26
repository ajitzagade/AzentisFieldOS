import { Injectable } from '@nestjs/common';
import type { LabourReportFilters } from '@azentisfieldos/shared';
import { TeamMembersService } from '../team/team-members.service';
import { WorkRecordsService } from '../team/work-records.service';
import { PaymentsService } from '../team/payments.service';
import { AdvancesService } from '../team/advances.service';
import { AdvanceAdjustmentsService } from '../team/advance-adjustments.service';

// Story 13.3 (FR-44): the Labour report view — a pure read-composition layer,
// the same discipline SiteInventoryReportsService (Story 13.2) applies. Every
// figure is a call into the Epic that owns it: Epic 6's WorkRecord history and
// weekly/monthly summary (TeamMembersService/WorkRecordsService), and Epic 7's
// Payment / Advance / AdvanceAdjustment history plus pooled Outstanding
// Balances (PaymentsService/AdvancesService/AdvanceAdjustmentsService/
// TeamMembersService). This service re-implements none of their queries — it
// threads the optional teamMemberId + from/to window into each and returns the
// composed shape.
//
// AD-1: there is NO tenantId / current-tenant filter anywhere in this layer,
// and adding one would be a defect. A deployment's database belongs to exactly
// one Tenant, so every row these queries can reach already belongs to this
// Tenant by construction — AC #2 is satisfied by that absence.
@Injectable()
export class LabourReportsService {
  constructor(
    private readonly teamMembers: TeamMembersService,
    private readonly workRecords: WorkRecordsService,
    private readonly payments: PaymentsService,
    private readonly advances: AdvancesService,
    private readonly advanceAdjustments: AdvanceAdjustmentsService,
  ) {}

  // FR-44: attendance/work history, payment totals + history, and the pooled
  // Advance / Adjustment ledger — all within the given window, optionally
  // narrowed to one Team Member (omitted teamMemberId = every person's data).
  //
  // `summary` and `outstanding` are deliberately window-independent aggregates
  // reused verbatim from Epic 6 Story 6.3 / Epic 7 Story 7.4 (the same shapes
  // the Team page and Dashboard read): the weekly/monthly *paid* totals and
  // the current pooled Outstanding Balance are point-in-time figures, not
  // sums over the from/to window, exactly as the Dev Notes call out.
  async getLabourReport(filters: LabourReportFilters) {
    const { teamMemberId, from, to } = filters;
    const scoped: LabourReportFilters = { teamMemberId, from, to };

    const [summary, outstanding, workRecords, payments, advances, adjustments] =
      await Promise.all([
        this.teamMembers.getTeamSummary(),
        this.teamMembers.getOutstandingAdvances(),
        this.workRecords.list(undefined, scoped),
        this.payments.list(scoped),
        this.advances.list(scoped),
        this.advanceAdjustments.list(scoped),
      ]);

    return {
      summary,
      outstanding,
      workRecords,
      payments,
      advances,
      adjustments,
    };
  }
}
