import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';

// How many rows one read returns — the audit trail grows forever; the
// trace-an-incident use case reads recent history, not the whole table.
const AUDIT_LOG_LIMIT = 200;

// Read side of the audit trail — Owner/Admin only (it names who did what).
// There is deliberately no write endpoint: rows are created exclusively by
// the AuditLogInterceptor, and never updated or deleted.
@UseGuards(RolesGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('OWNER_ADMIN')
  async list(
    @Query('siteId') siteId?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const rows = await this.prisma.auditLog.findMany({
      where: {
        ...(siteId ? { siteId } : {}),
        ...(userId ? { userId } : {}),
        occurredAt: dateRangeBounds(from, to),
      },
      include: { user: { select: { name: true } } },
      orderBy: { occurredAt: 'desc' },
      take: AUDIT_LOG_LIMIT,
    });

    // Resolve Site names here — deliberately including soft-deleted Sites,
    // which the public GET /sites list hides: the trail must still say
    // which Site an old change belonged to.
    const siteIds = [
      ...new Set(rows.map((r) => r.siteId).filter((x): x is string => !!x)),
    ];
    const sites =
      siteIds.length === 0
        ? []
        : await this.prisma.site.findMany({
            where: { id: { in: siteIds } },
            select: { id: true, name: true },
          });
    const siteNames = new Map(sites.map((s) => [s.id, s.name]));

    return rows.map((row) => ({
      ...row,
      siteName: row.siteId ? (siteNames.get(row.siteId) ?? null) : null,
    }));
  }
}
