import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateSubcontractorWorkEntryInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyQuantityDelta } from './quantity-completed';

export interface WorkEntriesListQuery {
  siteContractId?: string;
}

// FR-58: a recorded quantity of work done against an Active, non-Fixed-Cost
// Site Contract. Append-only (AD-9) — the one Supervisor-facing write
// surface in Epic 18.
@Injectable()
export class WorkEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: WorkEntriesListQuery = {}) {
    return this.prisma.subcontractorWorkEntry.findMany({
      where: query.siteContractId
        ? { siteContractId: query.siteContractId }
        : {},
      orderBy: { workDate: 'desc' },
    });
  }

  // Story 16.6: the global Search palette's Subcontractor Work Entry
  // coverage — matches the linked Site Contract's Subcontractor/Site name
  // and the free-text note. Open to any authenticated user, same as
  // list() — this is not one of the money-movement tables.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.SubcontractorWorkEntryGetPayload<{
      include: {
        siteContract: { include: { subcontractor: true; site: true } };
      };
    }>[];
    total: number;
  }> {
    const where: Prisma.SubcontractorWorkEntryWhereInput = {
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
      this.prisma.subcontractorWorkEntry.findMany({
        where,
        include: {
          siteContract: { include: { subcontractor: true, site: true } },
        },
        orderBy: { workDate: 'desc' },
        take: 200,
      }),
      this.prisma.subcontractorWorkEntry.count({ where }),
    ]);
    return { candidates, total };
  }

  async create(
    input: CreateSubcontractorWorkEntryInput,
    recordedByUserId: string,
  ) {
    const contract = await this.prisma.siteContract.findUnique({
      where: { id: input.siteContractId },
      include: { subcontractor: true },
    });
    if (!contract || contract.subcontractor.deletedAt) {
      throw new BadRequestException('This Site Contract does not exist');
    }
    // AC #3: only an Active contract accepts Work Entries — applies to a
    // correction too, since it targets the same (still-current) contract.
    if (contract.status !== 'ACTIVE') {
      throw new BadRequestException({
        error: {
          code: 'CONTRACT_NOT_ACTIVE',
          message:
            'Work Entries can only be recorded against an Active Site Contract',
        },
      });
    }
    // AC #2: Fixed Cost contracts have no billable quantity — completion is
    // tracked via status only (no BOQ/percent-complete concept in this
    // product, see Epic 2's "Activity Pulse" precedent).
    if (contract.rateType === 'FIXED_COST') {
      throw new BadRequestException({
        error: {
          code: 'FIXED_COST_NO_QUANTITY',
          message:
            "Fixed Cost contracts don't track work quantity — update the contract's status directly",
        },
      });
    }

    if (input.correctsId) {
      const original = await this.prisma.subcontractorWorkEntry.findUnique({
        where: { id: input.correctsId },
      });
      if (!original || original.siteContractId !== input.siteContractId) {
        throw new BadRequestException(
          'The Work Entry being corrected does not exist on this Site Contract',
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.subcontractorWorkEntry.create({
        data: { ...input, recordedByUserId },
      });
      // AD-9: quantityCompleted is materialized and write-path-only, updated
      // in the same transaction as the causing row. Floor-checked so a
      // reducing correction can never drive it below zero (AC #5).
      await applyQuantityDelta(tx, input.siteContractId, input.quantity);
      return entry;
    });
  }
}
