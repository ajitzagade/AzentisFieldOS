import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  collectActiveRequiredIssues,
  type CreateSiteContractInput,
  type UpdateSiteContractInput,
} from '@azentisfieldos/shared';
import { Prisma, type SiteContract } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeSiteContractAmounts } from './site-contracts.computed';

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
  constructor(private readonly prisma: PrismaService) {}

  // FR-60: every SiteContract this service returns carries its computed
  // amountPayable/outstandingAmount — a response-shaping step, never a
  // stored column (Task 1, Story 18.5).
  private withComputed<T extends SiteContract>(contract: T) {
    return { ...contract, ...computeSiteContractAmounts(contract) };
  }

  async create(input: CreateSiteContractInput) {
    const contract = await this.prisma.siteContract.create({ data: input });
    return this.withComputed(contract);
  }

  async list(query: SiteContractsListQuery = {}) {
    const where: Prisma.SiteContractWhereInput = {
      ...(query.siteId ? { siteId: query.siteId } : {}),
      ...(query.subcontractorId
        ? { subcontractorId: query.subcontractorId }
        : {}),
      ...(query.status
        ? { status: query.status as SiteContract['status'] }
        : {}),
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
    if (!contract || contract.subcontractor.deletedAt) {
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
      startDate:
        input.startDate !== undefined ? input.startDate : existing.startDate,
      status: (input.status !== undefined
        ? input.status
        : existing.status) as UpdateSiteContractInput['status'],
    };

    const issues = collectActiveRequiredIssues(merged);
    if (issues.length > 0) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of issues) {
        (fieldErrors[issue.path] ??= []).push(issue.message);
      }
      throw new BadRequestException({
        error: { code: 'VALIDATION_FAILED', details: { fieldErrors } },
      });
    }

    try {
      const updated = await this.prisma.siteContract.update({
        where: { id },
        data: input,
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

  // D7's countPendingPricing() shape, reused: how many Site Contracts are
  // still Draft with a genuinely missing rate-type-appropriate term — not
  // merely "not yet Active." A Draft contract that already has every
  // required field filled in (just hasn't been flipped to Active) does not
  // count here. `status: 'DRAFT'` already excludes Cancelled/Completed
  // contracts by construction (a single status field can't be both).
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
