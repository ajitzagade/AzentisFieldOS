import { describe, expect, it, vi } from 'vitest';
import { VendorAdvancesService } from './vendor-advances.service';

function makeService() {
  const findMany = vi.fn().mockResolvedValue([]);
  const prisma = { vendorAdvance: { findMany } };
  const service = new VendorAdvancesService(prisma as never);
  return { service, findMany };
}

// Writes only ever happen inline from WasteDisposalService.create — this
// service is read-only (see its own class-level comment).
describe('VendorAdvancesService.list', () => {
  it('scopes to the given vendorId, includes the linked Waste Disposal, orders by givenAt desc', async () => {
    const { service, findMany } = makeService();

    await service.list('v1');

    expect(findMany).toHaveBeenCalledWith({
      where: { vendorId: 'v1' },
      include: { wasteDisposal: { select: { id: true, wasteType: true } } },
      orderBy: { givenAt: 'desc' },
    });
  });
});
