import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../auth/roles.decorator';
import { AuditController } from './audit.controller';

function makeController() {
  const auditFindMany = vi.fn().mockResolvedValue([]);
  const siteFindMany = vi.fn().mockResolvedValue([]);
  const prisma = {
    auditLog: { findMany: auditFindMany },
    site: { findMany: siteFindMany },
  };
  const controller = new AuditController(
    prisma as unknown as ConstructorParameters<typeof AuditController>[0],
  );
  return { controller, auditFindMany, siteFindMany };
}

describe('AuditController.list', () => {
  it('is restricted to OWNER_ADMIN via @Roles metadata (the AC a Supervisor 403s on)', () => {
    const reflector = new Reflector();
    const roles = reflector.get<string[]>(
      ROLES_KEY,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- reading decorator metadata off the method reference, never invoking it
      AuditController.prototype.list,
    );
    expect(roles).toEqual(['OWNER_ADMIN']);
  });

  it('composes site/user/date filters into the query, newest first, capped', async () => {
    const { controller, auditFindMany } = makeController();

    await controller.list('site-1', 'user-1', '2026-08-01', '2026-08-31');

    const arg = auditFindMany.mock.calls[0]![0] as {
      where: {
        siteId: string;
        userId: string;
        occurredAt: { gte: Date; lt: Date };
      };
      orderBy: { occurredAt: string };
      take: number;
    };
    expect(arg.where.siteId).toBe('site-1');
    expect(arg.where.userId).toBe('user-1');
    expect(arg.where.occurredAt.gte).toEqual(new Date('2026-08-01'));
    expect(arg.orderBy).toEqual({ occurredAt: 'desc' });
    expect(arg.take).toBe(200);
  });

  it('resolves Site names WITHOUT the deletedAt filter — soft-deleted Sites keep their names in the trail', async () => {
    const { controller, auditFindMany, siteFindMany } = makeController();
    auditFindMany.mockResolvedValue([
      { id: 'a1', siteId: 'deleted-site', user: { name: 'Ajit' } },
    ]);
    siteFindMany.mockResolvedValue([
      { id: 'deleted-site', name: 'Old Bypass Site' },
    ]);

    const rows = (await controller.list()) as { siteName: string | null }[];

    // The lookup must be a plain id-in query with no deletedAt: null —
    // that filter would blank the very entries the trail exists to trace.
    const where = (
      siteFindMany.mock.calls[0]![0] as {
        where: Record<string, unknown>;
      }
    ).where;
    expect(where).toEqual({ id: { in: ['deleted-site'] } });
    expect(rows[0]!.siteName).toBe('Old Bypass Site');
  });
});
