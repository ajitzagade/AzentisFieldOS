import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateSubcontractorWorkEntryInput } from '@azentisfieldos/shared';
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

  async create(
    input: CreateSubcontractorWorkEntryInput,
    recordedByUserId: string,
  ) {
    const contract = await this.prisma.siteContract.findUnique({
      where: { id: input.siteContractId },
    });
    if (!contract) {
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
