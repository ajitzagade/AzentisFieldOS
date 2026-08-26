import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { SiteInventoryReportsService } from './site-inventory-reports.service';
import { getSiteActivityFeed } from '../sites/site-activity-feed';
import { getSitePhotoGallery } from '../sites/site-photo-gallery';

// The two feed/gallery helpers are free functions that query Prisma directly;
// stub them so these tests assert composition + filter threading, not their
// (separately tested) internals.
vi.mock('../sites/site-activity-feed', () => ({
  getSiteActivityFeed: vi.fn(),
}));
vi.mock('../sites/site-photo-gallery', () => ({
  getSitePhotoGallery: vi.fn(),
}));

function makeService() {
  const prisma = { site: { findUnique: vi.fn() } };
  const storage = {};
  const dsr = { listBySiteInRange: vi.fn().mockResolvedValue([]) };
  const stock = {
    getGodownStock: vi.fn().mockResolvedValue([]),
    getSiteStock: vi.fn().mockResolvedValue([]),
    getLowStockMaterials: vi.fn().mockResolvedValue([]),
  };
  const purchases = { list: vi.fn().mockResolvedValue([]) };
  const movements = { list: vi.fn().mockResolvedValue([]) };
  const consumption = { list: vi.fn().mockResolvedValue([]) };
  const returnWastage = { list: vi.fn().mockResolvedValue([]) };
  const service = new SiteInventoryReportsService(
    prisma as never,
    storage as never,
    dsr as never,
    stock as never,
    purchases as never,
    movements as never,
    consumption as never,
    returnWastage as never,
  );
  return {
    service,
    prisma,
    storage,
    dsr,
    stock,
    purchases,
    movements,
    consumption,
    returnWastage,
  };
}

beforeEach(() => {
  (getSiteActivityFeed as Mock).mockReset().mockResolvedValue([]);
  (getSitePhotoGallery as Mock).mockReset().mockResolvedValue([]);
});

describe('SiteInventoryReportsService.getSiteReport (FR-42)', () => {
  it('composes DSR history, photo gallery, and activity feed, threading the date window into each source', async () => {
    const ctx = makeService();
    ctx.prisma.site.findUnique.mockResolvedValue({
      id: 'site1',
      name: 'NH-48',
      location: 'Ch. 4+200',
      status: 'ACTIVE',
    });
    ctx.dsr.listBySiteInRange.mockResolvedValue([{ id: 'dsr1' }]);
    (getSitePhotoGallery as Mock).mockResolvedValue([{ id: 'photo1' }]);
    (getSiteActivityFeed as Mock).mockResolvedValue([{ id: 'feed1' }]);

    const result = await ctx.service.getSiteReport({
      siteId: 'site1',
      from: '2026-08-01',
      to: '2026-08-31',
    });

    expect(ctx.dsr.listBySiteInRange).toHaveBeenCalledWith(
      'site1',
      '2026-08-01',
      '2026-08-31',
    );
    expect(getSitePhotoGallery).toHaveBeenCalledWith(
      ctx.prisma,
      ctx.storage,
      'site1',
      { from: '2026-08-01', to: '2026-08-31' },
    );
    expect(getSiteActivityFeed).toHaveBeenCalledWith(ctx.prisma, 'site1', {
      from: '2026-08-01',
      to: '2026-08-31',
    });
    expect(result).toEqual({
      site: {
        id: 'site1',
        name: 'NH-48',
        location: 'Ch. 4+200',
        status: 'ACTIVE',
      },
      dsrs: [{ id: 'dsr1' }],
      photos: [{ id: 'photo1' }],
      feed: [{ id: 'feed1' }],
    });
  });

  it('returns an empty shell (no DB read) when no Site is selected yet', async () => {
    const ctx = makeService();

    const result = await ctx.service.getSiteReport({});

    expect(result).toEqual({ site: null, dsrs: [], photos: [], feed: [] });
    expect(ctx.prisma.site.findUnique).not.toHaveBeenCalled();
    expect(ctx.dsr.listBySiteInRange).not.toHaveBeenCalled();
  });

  it('404s when the requested Site does not exist', async () => {
    const ctx = makeService();
    ctx.prisma.site.findUnique.mockResolvedValue(null);

    await expect(
      ctx.service.getSiteReport({ siteId: 'ghost' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('a window with no matching records is an empty result set, not an error', async () => {
    const ctx = makeService();
    ctx.prisma.site.findUnique.mockResolvedValue({
      id: 'site1',
      name: 'NH-48',
      location: 'Ch. 4+200',
      status: 'ACTIVE',
    });
    // Every source resolves empty for this window (default mocks).
    const result = await ctx.service.getSiteReport({
      siteId: 'site1',
      from: '2099-01-01',
      to: '2099-12-31',
    });

    expect(result.dsrs).toEqual([]);
    expect(result.photos).toEqual([]);
    expect(result.feed).toEqual([]);
  });
});

describe('SiteInventoryReportsService.getInventoryReport (FR-43)', () => {
  it('composes stock, low-stock, and the four transaction histories, threading filters into each', async () => {
    const ctx = makeService();
    ctx.stock.getGodownStock.mockResolvedValue([{ materialSizeId: 'ms1' }]);
    ctx.stock.getSiteStock.mockResolvedValue([{ materialSizeId: 'ms2' }]);
    ctx.stock.getLowStockMaterials.mockResolvedValue([{ id: 'mLow' }]);
    ctx.purchases.list.mockResolvedValue([{ id: 'pu1' }]);
    ctx.movements.list.mockResolvedValue([{ id: 'mo1' }]);
    ctx.consumption.list.mockResolvedValue([{ id: 'co1' }]);
    ctx.returnWastage.list.mockResolvedValue([{ id: 'rw1' }]);

    const filters = {
      siteId: 'site1',
      materialId: 'mat1',
      from: '2026-08-01',
      to: '2026-08-31',
    };
    const result = await ctx.service.getInventoryReport(filters);

    expect(ctx.stock.getGodownStock).toHaveBeenCalledWith('mat1');
    expect(ctx.stock.getSiteStock).toHaveBeenCalledWith('site1', 'mat1');
    expect(ctx.purchases.list).toHaveBeenCalledWith(filters);
    expect(ctx.movements.list).toHaveBeenCalledWith(filters);
    expect(ctx.consumption.list).toHaveBeenCalledWith(filters);
    expect(ctx.returnWastage.list).toHaveBeenCalledWith(filters);
    expect(result).toEqual({
      godownStock: [{ materialSizeId: 'ms1' }],
      siteStock: [{ materialSizeId: 'ms2' }],
      lowStock: [{ id: 'mLow' }],
      purchases: [{ id: 'pu1' }],
      movements: [{ id: 'mo1' }],
      consumptions: [{ id: 'co1' }],
      returnWastages: [{ id: 'rw1' }],
    });
  });

  it('omits Site Stock when no Site is selected (Story 5.7 reads it one Site at a time)', async () => {
    const ctx = makeService();

    const result = await ctx.service.getInventoryReport({ materialId: 'mat1' });

    expect(ctx.stock.getSiteStock).not.toHaveBeenCalled();
    expect(result.siteStock).toEqual([]);
    // Godown stock, low-stock flags, and all-Site transaction history still compose.
    expect(ctx.stock.getGodownStock).toHaveBeenCalledWith('mat1');
    expect(ctx.purchases.list).toHaveBeenCalled();
  });

  it('a window with no matching transactions is an empty result set, not an error', async () => {
    const ctx = makeService();

    const result = await ctx.service.getInventoryReport({
      from: '2099-01-01',
      to: '2099-12-31',
    });

    expect(result).toEqual({
      godownStock: [],
      siteStock: [],
      lowStock: [],
      purchases: [],
      movements: [],
      consumptions: [],
      returnWastages: [],
    });
  });
});
