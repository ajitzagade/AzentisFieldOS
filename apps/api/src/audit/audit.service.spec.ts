import { describe, expect, it, vi } from 'vitest';
import { AuditService } from './audit.service';

describe('AuditService.searchCandidates', () => {
  it('matches the action summary, entity type, and acting user name, all case-insensitively', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const count = vi.fn().mockResolvedValue(0);
    const prisma = { auditLog: { findMany, count } };
    const service = new AuditService(
      prisma as unknown as ConstructorParameters<typeof AuditService>[0],
    );

    await service.searchCandidates('payment');

    const expectedWhere = {
      OR: [
        { action: { contains: 'payment', mode: 'insensitive' } },
        { entityType: { contains: 'payment', mode: 'insensitive' } },
        { user: { name: { contains: 'payment', mode: 'insensitive' } } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expectedWhere }),
    );
    expect(count).toHaveBeenCalledWith({ where: expectedWhere });
  });
});
