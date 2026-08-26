import { describe, expect, it, vi } from 'vitest';
import { DsrService } from './dsr.service';

// Focused unit coverage for Story 13.2's listBySiteInRange (the DailySiteReport
// query the Site Reports view reuses) — the fuller create/correct paths are
// exercised in dsr.service.integration.spec.ts against a real DB.
function makeService(rows: unknown[]) {
  const findMany = vi.fn().mockResolvedValue(rows);
  const prisma = { dailySiteReport: { findMany } };
  const storage = {};
  const service = new DsrService(prisma as never, storage as never);
  return { service, findMany };
}

describe('DsrService.listBySiteInRange (FR-42)', () => {
  it('scopes to the Site and threads the date window onto reportDate', async () => {
    const { service, findMany } = makeService([]);

    await service.listBySiteInRange('site1', '2026-08-01', '2026-08-31');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          siteId: 'site1',
          reportDate: {
            gte: new Date('2026-08-01T00:00:00.000Z'),
            lt: new Date('2026-09-01T00:00:00.000Z'),
          },
        },
        orderBy: { reportDate: 'desc' },
      }),
    );
  });

  it('passes an undefined reportDate filter through when no window is given', async () => {
    const { service, findMany } = makeService([]);

    await service.listBySiteInRange('site1');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { siteId: 'site1', reportDate: undefined },
      }),
    );
  });

  it('drops any report a later correction supersedes, keeping only current versions', async () => {
    // original <- correction: the correction points at the original via
    // correctsId, so only the correction (the tip) survives.
    const { service } = makeService([
      { id: 'original', correctsId: null },
      { id: 'correction', correctsId: 'original' },
    ]);

    const result = await service.listBySiteInRange('site1');

    expect(result.map((r) => r.id)).toEqual(['correction']);
  });

  it('returns an empty array (not an error) when the window matches nothing', async () => {
    const { service } = makeService([]);

    await expect(service.listBySiteInRange('site1')).resolves.toEqual([]);
  });
});
