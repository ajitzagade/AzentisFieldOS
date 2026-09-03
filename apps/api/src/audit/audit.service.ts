import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Story 16.6: the global Search palette's Audit Log coverage. There is no
// write path here (AuditController's own comment: rows are created
// exclusively by AuditLogInterceptor) — this service exists solely to give
// search.service.ts's composition a searchCandidates() to call, matching
// every other searchable entity's pattern, without duplicating
// AuditController.list()'s own direct-Prisma read logic.
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  // Matches the human-readable action summary, the affected entity type,
  // and the acting user's name. This is one of the two entities the search
  // layer must role-gate to OWNER_ADMIN (Story 16.5's mechanism), matching
  // AuditController.list()'s own @Roles('OWNER_ADMIN') — this method itself
  // applies no role filter, since search.service.ts enforces it uniformly.
  async searchCandidates(q: string): Promise<{
    candidates: Prisma.AuditLogGetPayload<{ include: { user: true } }>[];
    total: number;
  }> {
    const where: Prisma.AuditLogWhereInput = {
      OR: [
        { action: { contains: q, mode: 'insensitive' as const } },
        { entityType: { contains: q, mode: 'insensitive' as const } },
        { user: { name: { contains: q, mode: 'insensitive' as const } } },
      ],
    };
    const [candidates, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: true },
        orderBy: { occurredAt: 'desc' },
        take: 200,
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { candidates, total };
  }
}
