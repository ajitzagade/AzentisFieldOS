import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateSubcontractorPaymentInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyAmountPaidDelta } from './amount-paid';

export interface SubcontractorPaymentsListQuery {
  siteContractId?: string;
}

// FR-59: a Payment or Advance made to a Subcontractor against a Site
// Contract. Append-only (AD-9). Owner/Admin only (money movement) — see
// SubcontractorPaymentsController.
@Injectable()
export class SubcontractorPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: SubcontractorPaymentsListQuery = {}) {
    return this.prisma.subcontractorPayment.findMany({
      where: query.siteContractId
        ? { siteContractId: query.siteContractId }
        : {},
      orderBy: { paidAt: 'desc' },
    });
  }

  // Story 16.6: the global Search palette's Subcontractor Payment coverage
  // — matches the linked Site Contract's Subcontractor/Site name and the
  // free-text note. This is one of the two entities the search layer must
  // role-gate to OWNER_ADMIN (Story 16.5's mechanism), matching this
  // controller's own class-level @Roles('OWNER_ADMIN') — this method itself
  // applies no role filter, since search.service.ts enforces it uniformly.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.SubcontractorPaymentGetPayload<{
      include: {
        siteContract: { include: { subcontractor: true; site: true } };
      };
    }>[];
    total: number;
  }> {
    const where: Prisma.SubcontractorPaymentWhereInput = {
      OR: [
        {
          siteContract: {
            subcontractor: {
              name: { contains: q, mode: 'insensitive' as const },
            },
          },
        },
        {
          siteContract: {
            site: { name: { contains: q, mode: 'insensitive' as const } },
          },
        },
        { note: { contains: q, mode: 'insensitive' as const } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.subcontractorPayment.findMany({
        where,
        include: {
          siteContract: { include: { subcontractor: true, site: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: 200,
      }),
      this.prisma.subcontractorPayment.count({ where }),
    ]);
    return { candidates, total };
  }

  async create(
    input: CreateSubcontractorPaymentInput,
    recordedByUserId: string,
  ) {
    const contract = await this.prisma.siteContract.findUnique({
      where: { id: input.siteContractId },
      include: { subcontractor: true },
    });
    if (!contract || contract.subcontractor.deletedAt) {
      throw new BadRequestException('This Site Contract does not exist');
    }
    // AC #2: no payable cap — a Payment/Advance may legitimately exceed the
    // amount currently payable. No status/rateType restriction either
    // (unlike Work Entries): paying an advance before a contract is even
    // Active, or against a Fixed Cost contract, is realistic.

    if (input.correctsId) {
      const original = await this.prisma.subcontractorPayment.findUnique({
        where: { id: input.correctsId },
      });
      if (!original || original.siteContractId !== input.siteContractId) {
        throw new BadRequestException(
          'The Payment being corrected does not exist on this Site Contract',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.subcontractorPayment.create({
        data: { ...input, recordedByUserId },
      });
      // AD-9: amountPaid is materialized and write-path-only, updated in
      // the same transaction as the causing row. Floor-checked at zero only
      // (AC #4) — no ceiling.
      await applyAmountPaidDelta(tx, input.siteContractId, input.amount);
      return payment;
    });
  }
}
