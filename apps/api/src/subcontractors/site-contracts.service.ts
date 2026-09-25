import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  collectActiveRequiredIssues,
  collectRateTypeIssues,
  contractStatusSchema,
  type CreateSiteContractInput,
  type UpdateSiteContractInput,
} from '@azentisfieldos/shared';
import { Prisma, type SiteContract } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeSiteContractAmounts } from './site-contracts.computed';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

export interface SiteContractsListQuery {
  siteId?: string;
  subcontractorId?: string;
  status?: string;
}

// FR-56/FR-57: a Subcontractor's engagement on a Site, with flexible rate
// terms. Master/agreement data (like Site) — edited in place via a normal
// PATCH, not one of AD-9's append-only tables (see schema.prisma's comment
// on SiteContract for why this deliberately does NOT reuse Purchase's D7
// atomic-one-time-fill mechanism).
@Injectable()
export class SiteContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushNotifications: PushNotificationsService,
  ) {}

  // FR-60: every SiteContract this service returns carries its computed
  // amountPayable/outstandingAmount — a response-shaping step, never a
  // stored column (Task 1, Story 18.5).
  private withComputed<T extends SiteContract>(contract: T) {
    return { ...contract, ...computeSiteContractAmounts(contract) };
  }

  // Same "pending terms" definition as countDraftPendingTerms below, just
  // evaluated against one freshly-created row instead of queried — kept in
  // sync deliberately (see that method's own comment) rather than issuing a
  // second DB round-trip to re-derive the same fact.
  private isPendingTerms(
    contract: Pick<
      SiteContract,
      | 'status'
      | 'workCategory'
      | 'rateType'
      | 'startDate'
      | 'fixedAmount'
      | 'rate'
    >,
  ): boolean {
    if (contract.status !== 'DRAFT') return false;
    if (!contract.workCategory || !contract.rateType || !contract.startDate)
      return true;
    if (contract.rateType === 'FIXED_COST')
      return contract.fixedAmount === null;
    return contract.rate === null;
  }

  async create(input: CreateSiteContractInput, createdByUserId?: string) {
    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id: input.subcontractorId },
    });
    if (!subcontractor || subcontractor.deletedAt) {
      throw new BadRequestException('This Subcontractor does not exist');
    }
    const site = await this.prisma.site.findUnique({
      where: { id: input.siteId },
    });
    if (!site || site.deletedAt) {
      throw new BadRequestException('This Site does not exist');
    }

    // Client-readiness UX fix (2026-09-25): same reasoning as this
    // service's own update() auto-activate — a Site Engineer creating a
    // brand-new Site Contract (the DSR "+ Create Site Contract"
    // quick-create) with every ACTIVE-required field filled in shouldn't
    // also have to remember to flip the Status dropdown off its DRAFT
    // default. If the contract would otherwise be created Draft but
    // already satisfies FR-57's requirements, create it Active instead. An
    // explicit non-Draft status the caller actually chose always wins —
    // this only fires when `input.status` is still DRAFT.
    const dataToPersist: CreateSiteContractInput =
      input.status === 'DRAFT' &&
      collectActiveRequiredIssues({ ...input, status: 'ACTIVE' }).length === 0
        ? { ...input, status: 'ACTIVE' }
        : input;

    const contract = await this.prisma.siteContract.create({
      data: dataToPersist,
    });

    if (this.isPendingTerms(contract)) {
      void this.pushNotifications.sendToRole(
        'OWNER_ADMIN',
        {
          title: 'Site Contract needs terms',
          body: `A new Site Contract at ${site.name} still needs its terms filled in.`,
          url: `/sites/${site.id}/contracts/${contract.id}`,
        },
        createdByUserId,
      );
    }

    return this.withComputed(contract);
  }

  async list(query: SiteContractsListQuery = {}) {
    const parsedStatus = query.status
      ? contractStatusSchema.safeParse(query.status)
      : undefined;
    if (parsedStatus && !parsedStatus.success) {
      throw new BadRequestException(`Invalid status filter: ${query.status}`);
    }
    const where: Prisma.SiteContractWhereInput = {
      ...(query.siteId ? { siteId: query.siteId } : {}),
      ...(query.subcontractorId
        ? { subcontractorId: query.subcontractorId }
        : {}),
      ...(parsedStatus?.success ? { status: parsedStatus.data } : {}),
    };
    const contracts = await this.prisma.siteContract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { subcontractor: true, site: true },
    });
    return contracts.map((c) => this.withComputed(c));
  }

  async findOne(id: string) {
    const contract = await this.prisma.siteContract.findUnique({
      where: { id },
      include: { subcontractor: true, site: true },
    });
    if (
      !contract ||
      contract.subcontractor.deletedAt ||
      contract.site.deletedAt
    ) {
      throw new NotFoundException(`Site Contract ${id} not found`);
    }
    return this.withComputed(contract);
  }

  // FR-57: transitioning to (or remaining) ACTIVE requires work category,
  // rate type, the rate-type-appropriate rate/amount, and a start date to
  // all be present on the RESULTING record — not just the fields this one
  // PATCH happens to send. A request sending only `{ status: "ACTIVE" }`
  // against a Draft row still missing terms must be rejected exactly like
  // one that sends the terms and the status together.
  async update(id: string, input: UpdateSiteContractInput) {
    const existing = await this.findOne(id);

    // Prisma's `rateType`/`status` are plain `string`-shaped columns at the
    // client-type level (rateType always was, by design; status is the
    // Prisma-generated ContractStatus enum) — both share their literal
    // values with the shared Zod vocabulary, so a cast here is safe.
    const merged = {
      workCategory:
        input.workCategory !== undefined
          ? input.workCategory
          : existing.workCategory,
      rateType: (input.rateType !== undefined
        ? input.rateType
        : existing.rateType) as CreateSiteContractInput['rateType'] | null,
      rate: input.rate !== undefined ? input.rate : existing.rate?.toNumber(),
      fixedAmount:
        input.fixedAmount !== undefined
          ? input.fixedAmount
          : existing.fixedAmount?.toNumber(),
      rateUnitLabel:
        input.rateUnitLabel !== undefined
          ? input.rateUnitLabel
          : existing.rateUnitLabel,
      startDate:
        input.startDate !== undefined ? input.startDate : existing.startDate,
      status: (input.status !== undefined
        ? input.status
        : existing.status) as UpdateSiteContractInput['status'],
    };

    // Client-readiness UX fix (2026-09-24): an Owner completing a Draft
    // contract's terms via this same PATCH (the "Edit terms" form) rarely
    // also remembers to flip the Status dropdown to Active — and a DSR
    // Subcontractor row logged against a still-Draft contract silently
    // never becomes a billable Work Entry (Quantity stays disabled
    // client-side until the contract is Active, see
    // dsr-desktop-form.tsx's isPickedContractActive). If the resulting
    // record satisfies every ACTIVE-required field (FR-57) while its status
    // would otherwise still read Draft, promote it to Active as part of
    // this same save. An explicit non-Draft status (Active/Completed/
    // Cancelled) sent in this request always wins over this inference —
    // deliberately NOT gated on whether the caller happened to also send
    // `status: 'DRAFT'` explicitly, since the Edit terms form's Status
    // <select> always submits a value and can't distinguish "left alone"
    // from "actively re-picked." An Owner who wants to stage complete terms
    // without going live yet can leave one required field blank instead.
    const autoActivated =
      existing.status === 'DRAFT' &&
      merged.status === 'DRAFT' &&
      collectActiveRequiredIssues({ ...merged, status: 'ACTIVE' }).length === 0;
    if (autoActivated) {
      merged.status = 'ACTIVE';
    }

    const issues = [
      ...collectRateTypeIssues(merged),
      ...collectActiveRequiredIssues(merged),
    ];
    if (issues.length > 0) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of issues) {
        (fieldErrors[issue.path] ??= []).push(issue.message);
      }
      throw new BadRequestException({
        error: { code: 'VALIDATION_FAILED', details: { fieldErrors } },
      });
    }

    const dataToPersist: UpdateSiteContractInput = autoActivated
      ? { ...input, status: 'ACTIVE' }
      : input;

    try {
      const updated = await this.prisma.siteContract.update({
        where: { id },
        data: dataToPersist,
      });
      return this.withComputed(updated);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Site Contract ${id} not found`);
      }
      throw error;
    }
  }

  // FR-63: total outstanding-to-Subcontractors, drillable per Subcontractor
  // — sums every Site Contract's computed outstandingAmount (Story 18.5's
  // Task 1 logic, reused here rather than reimplemented). A Cancelled
  // contract's outstanding is included: money already owed for work done
  // doesn't stop being owed because the engagement ended. A Draft
  // contract's still-pending outstandingAmount (null) contributes 0 to the
  // sum by definition — an unpriced engagement isn't a known payable yet.
  async outstandingSummary() {
    const contracts = await this.prisma.siteContract.findMany({
      include: { subcontractor: true },
    });

    const bySubcontractor = new Map<
      string,
      {
        subcontractorId: string;
        subcontractorName: string;
        outstanding: number;
      }
    >();
    let totalOutstanding = 0;

    for (const contract of contracts) {
      const { outstandingAmount } = computeSiteContractAmounts(contract);
      const amount = outstandingAmount ?? 0;
      totalOutstanding += amount;

      const existing = bySubcontractor.get(contract.subcontractorId);
      if (existing) {
        existing.outstanding += amount;
      } else {
        bySubcontractor.set(contract.subcontractorId, {
          subcontractorId: contract.subcontractorId,
          subcontractorName: contract.subcontractor.name,
          outstanding: amount,
        });
      }
    }

    return {
      totalOutstanding,
      bySubcontractor: Array.from(bySubcontractor.values()),
    };
  }

  // Story 16.6: the global Search palette's Site Contract coverage —
  // matches the linked Subcontractor/Site name and the work category.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.SiteContractGetPayload<{
      include: { subcontractor: true; site: true };
    }>[];
    total: number;
  }> {
    const where: Prisma.SiteContractWhereInput = {
      OR: [
        {
          subcontractor: {
            name: { contains: q, mode: 'insensitive' as const },
          },
        },
        { site: { name: { contains: q, mode: 'insensitive' as const } } },
        { workCategory: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.siteContract.findMany({
        where,
        include: { subcontractor: true, site: true },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
      this.prisma.siteContract.count({ where }),
    ]);
    return { candidates, total };
  }

  // D7's countPendingPricing() shape, reused: how many Site Contracts are
  // still Draft with a genuinely missing rate-type-appropriate term — not
  // merely "not yet Active." A Draft contract that already has every
  // required field filled in (just hasn't been flipped to Active) does not
  // count here. `status: 'DRAFT'` already excludes Cancelled/Completed
  // contracts by construction (a single status field can't be both).
  // Kept in sync with isPendingTerms() above by hand — same five conditions,
  // expressed as a query instead of a predicate over one row.
  countDraftPendingTerms() {
    return this.prisma.siteContract.count({
      where: {
        status: 'DRAFT',
        OR: [
          { workCategory: null },
          { rateType: null },
          { startDate: null },
          {
            AND: [{ rateType: 'FIXED_COST' }, { fixedAmount: null }],
          },
          {
            AND: [
              { rateType: { not: 'FIXED_COST' } },
              { rateType: { not: null } },
              { rate: null },
            ],
          },
        ],
      },
    });
  }
}
