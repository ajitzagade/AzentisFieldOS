import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import { type Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/current-user.decorator';

// Maps a route's first path segment to a human entity label — extend when a
// new write surface is added (an unmapped segment still logs, with the raw
// segment as its label, so coverage never silently lapses).
const ENTITY_LABELS: Record<string, string> = {
  sites: 'Site',
  materials: 'Material',
  units: 'Unit',
  'material-categories': 'Material Category',
  purchases: 'Purchase',
  movements: 'Movement',
  consumption: 'Consumption',
  'return-wastage': 'Return/Wastage',
  dsr: 'Daily Site Report',
  photos: 'Photo',
  'team-members': 'Team Member',
  'work-records': 'Work Record',
  advances: 'Advance',
  'advance-adjustments': 'Advance Adjustment',
  payments: 'Payment',
  'rmc-entries': 'RMC Entry',
  expenses: 'Expense',
  'expense-categories': 'Expense Category',
  'employment-types': 'Employment Type',
  'machinery-types': 'Machinery Type',
  'vehicle-types': 'Vehicle Type',
  machinery: 'Machinery',
  vehicles: 'Vehicle',
  'asset-movements': 'Asset Movement',
  'asset-service-logs': 'Asset Service Log',
  vendors: 'Vendor',
  'waste-disposals': 'Waste Disposal',
  users: 'User',
  'branding-config': 'Branding Config',
  'notification-settings': 'Notification Setting',
  'report-schedules': 'Report Schedule',
};

// Paths whose writes must never be audited: credentials (never log a login
// body's existence per-user this way), presign handshakes (the real write is
// the confirm), and cron endpoints (no human actor).
const SKIP_PREFIXES = ['/auth', '/cron', '/photos/presign', '/photos/challan'];

interface MutatingRequest {
  method: string;
  url: string;
  user?: AuthUser;
  body?: Record<string, unknown>;
}

// The audit trail (write-once): one row per successful mutating request,
// captured globally so every write endpoint — including future ones — is
// covered by construction, with zero per-service code. Logging is
// best-effort by design: an audit-write failure is logged but never fails
// the user's own request.
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<MutatingRequest>();
    const { method, url, user, body } = request;

    if (
      (method !== 'POST' && method !== 'PATCH' && method !== 'DELETE') ||
      !user?.id ||
      SKIP_PREFIXES.some((prefix) => url.startsWith(prefix))
    ) {
      return next.handle();
    }

    const path = url.split('?')[0] ?? url;
    return next.handle().pipe(
      tap((response) => {
        void this.record(method, path, user.id, body, response).catch(
          (error: unknown) => {
            this.logger.warn(`audit write failed for ${method} ${path}`, error);
          },
        );
      }),
    );
  }

  private async record(
    method: string,
    path: string,
    userId: string,
    body: Record<string, unknown> | undefined,
    response: unknown,
  ) {
    const segment = path.split('/').filter(Boolean)[0] ?? path;
    const entityType = ENTITY_LABELS[segment] ?? segment;

    const responseId =
      response && typeof response === 'object' && 'id' in response
        ? String(response.id)
        : undefined;
    const responseSiteId =
      response && typeof response === 'object' && 'siteId' in response
        ? response.siteId
        : undefined;
    // "Under which Site": the write's own siteId when it carries one; for
    // actions on a Site itself (create/update/delete Site), the Site IS the
    // entity — use its id so the trail's Site column is never blank there.
    const siteId =
      typeof body?.siteId === 'string'
        ? body.siteId
        : typeof responseSiteId === 'string'
          ? responseSiteId
          : entityType === 'Site'
            ? responseId
            : undefined;

    await this.prisma.auditLog.create({
      data: {
        userId,
        method,
        path,
        action: this.describe(method, path, entityType, body),
        entityType,
        entityId: responseId,
        siteId,
      },
    });
  }

  private describe(
    method: string,
    path: string,
    entityType: string,
    body: Record<string, unknown> | undefined,
  ): string {
    if (method === 'DELETE') return `Deleted ${entityType}`;
    if (method === 'PATCH') {
      if (path.endsWith('/mark-paid')) return 'Marked Payment as paid';
      if (path.endsWith('/confirm-receipt'))
        return 'Confirmed Movement receipt';
      return `Updated ${entityType}`;
    }
    if (path.endsWith('/correct') || body?.correctsId)
      return `Corrected ${entityType}`;
    return `Created ${entityType}`;
  }
}
