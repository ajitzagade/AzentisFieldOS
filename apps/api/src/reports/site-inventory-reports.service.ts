import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  InventoryReportFilters,
  SiteReportFilters,
} from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { DsrService } from '../dsr/dsr.service';
import { StockService } from '../inventory/stock.service';
import { PurchasesService } from '../inventory/purchases.service';
import { MovementsService } from '../inventory/movements.service';
import { ConsumptionService } from '../inventory/consumption.service';
import { ReturnWastageService } from '../inventory/return-wastage.service';
import { getSiteActivityFeed } from '../sites/site-activity-feed';
import { getSitePhotoGallery } from '../sites/site-photo-gallery';

// Story 13.2 (FR-42/FR-43): the Site & Inventory report views — a pure
// read-composition layer, exactly the discipline Epic 12's DashboardService
// applies. Every figure is a call into the epic that owns it (Epic 2's Site
// activity feed, Epic 3's DailySiteReport/Photo, Epic 5's
// stock/purchase/movement/consumption/return-wastage), threaded with the
// requested from/to window; this service re-implements none of their queries.
//
// AD-1: there is NO tenantId / current-tenant filter anywhere in this layer,
// and adding one would be a defect. A deployment's database belongs to
// exactly one Tenant, so every row these queries can reach already belongs to
// this Tenant by construction — AC #2 is satisfied by that absence, not by a
// WHERE clause here.
@Injectable()
export class SiteInventoryReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly dsr: DsrService,
    private readonly stock: StockService,
    private readonly purchases: PurchasesService,
    private readonly movements: MovementsService,
    private readonly consumption: ConsumptionService,
    private readonly returnWastage: ReturnWastageService,
  ) {}

  // FR-42: DSR history, activity/progress history, and photo history for one
  // Site, all within the given date window. A report is inherently
  // per-Site, so with no siteId there is nothing to compose yet — return an
  // empty shell (the Site picker's "no selection" state) rather than error.
  async getSiteReport(filters: SiteReportFilters) {
    const { siteId, from, to } = filters;
    if (!siteId) {
      return { site: null, dsrs: [], photos: [], feed: [] };
    }

    const site = await this.prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, name: true, location: true, status: true },
    });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} not found`);
    }

    const [dsrs, photos, feed] = await Promise.all([
      this.dsr.listBySiteInRange(siteId, from, to),
      getSitePhotoGallery(this.prisma, this.storage, siteId, { from, to }),
      getSiteActivityFeed(this.prisma, siteId, { from, to }),
    ]);

    return { site, dsrs, photos, feed };
  }

  // FR-43: a filtered, report-oriented re-presentation of Epic 5 Story 5.7's
  // Inventory page — current stock (a snapshot, so unaffected by from/to),
  // low-stock flags, and the four transaction histories within the window.
  // With no siteId, Site Stock has no single Site to read (Story 5.7 exposes
  // it one Site at a time) so it is empty; Godown Stock, low-stock flags, and
  // the (all-Site) transaction histories still compose.
  async getInventoryReport(filters: InventoryReportFilters) {
    const { siteId, materialId } = filters;
    const [
      godownStock,
      siteStock,
      lowStock,
      purchases,
      movements,
      consumptions,
      returnWastages,
    ] = await Promise.all([
      this.stock.getGodownStock(materialId),
      siteId
        ? this.stock.getSiteStock(siteId, materialId)
        : Promise.resolve([]),
      this.stock.getLowStockMaterials(),
      this.purchases.list(filters),
      this.movements.list(filters),
      this.consumption.list(filters),
      this.returnWastage.list(filters),
    ]);

    return {
      godownStock,
      siteStock,
      lowStock,
      purchases,
      movements,
      consumptions,
      returnWastages,
    };
  }
}
