import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSubcontractorWorkEntryInput } from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createWorkEntry } from './work-entry-write';

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

  // spec-dsr-activity-sync-detail-panel (goal 5): Site Activity Feed detail
  // panel target for a WORK_ENTRY row — same include shape as
  // searchCandidates above.
  async findOne(id: string) {
    const entry = await this.prisma.subcontractorWorkEntry.findUnique({
      where: { id },
      include: {
        siteContract: { include: { subcontractor: true, site: true } },
      },
    });
    if (!entry) {
      throw new NotFoundException(`Work Entry ${id} not found`);
    }
    return entry;
  }

  // spec-dsr-activity-sync-detail-panel (goal 4): the validation + create +
  // applyQuantityDelta body now lives in work-entry-write.ts's
  // tx-accepting createWorkEntry(), shared with dsr.service.ts's DSR-
  // embedded Subcontractor entries — this wraps it in its own transaction,
  // no behavior change to the standalone path.
  async create(
    input: CreateSubcontractorWorkEntryInput,
    recordedByUserId: string,
  ) {
    return this.prisma.$transaction((tx) =>
      createWorkEntry(tx, input, recordedByUserId),
    );
  }
}
