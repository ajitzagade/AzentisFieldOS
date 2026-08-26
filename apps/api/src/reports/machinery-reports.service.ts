import { Injectable } from '@nestjs/common';
import type { MachineryReportFilters } from '@azentisfieldos/shared';
import { MachineryService } from '../assets/machinery.service';
import { VehicleService } from '../assets/vehicle.service';
import { AssetMovementsService } from '../assets/asset-movements.service';
import { AssetServiceLogsService } from '../assets/asset-service-logs.service';

// Story 13.3 (FR-45): the Machinery/Vehicle report view — a pure
// read-composition layer, the same discipline SiteInventoryReportsService
// (Story 13.2) applies. Current-status/usage comes from Epic 8 Story 8.1's
// registers (MachineryService/VehicleService), movement history from Story
// 8.2 (AssetMovementsService), and service history from Story 8.3
// (AssetServiceLogsService) — each threaded with the requested from/to window.
// This service re-implements none of their queries.
//
// AD-1: there is NO tenantId / current-tenant filter anywhere in this layer,
// and adding one would be a defect (see LabourReportsService's note).
@Injectable()
export class MachineryVehicleReportsService {
  constructor(
    private readonly machinery: MachineryService,
    private readonly vehicle: VehicleService,
    private readonly assetMovements: AssetMovementsService,
    private readonly assetServiceLogs: AssetServiceLogsService,
  ) {}

  // FR-45: the register (current-status of every Machine/Vehicle) always
  // composes. Movement and service history are inherently per-asset (Story
  // 8.2/8.3 read them one asset at a time), so with no asset picked they are
  // empty — the "select an asset" state — exactly as the Site report leaves
  // its per-Site sections empty until a Site is chosen. `findOne` 404s a
  // non-existent asset, same as the Site report 404s a non-existent Site.
  async getMachineryReport(filters: MachineryReportFilters) {
    const { assetType, assetId, from, to } = filters;
    const hasAsset = Boolean(assetType && assetId);

    const [machinery, vehicles, asset, movements, serviceLogs] =
      await Promise.all([
        this.machinery.list(),
        this.vehicle.list(),
        hasAsset
          ? assetType === 'MACHINERY'
            ? this.machinery.findOne(assetId!)
            : this.vehicle.findOne(assetId!)
          : Promise.resolve(null),
        hasAsset
          ? this.assetMovements.list(assetType!, assetId!, { from, to })
          : Promise.resolve([]),
        hasAsset
          ? this.assetServiceLogs.list(assetType!, assetId!, { from, to })
          : Promise.resolve([]),
      ]);

    return { machinery, vehicles, asset, movements, serviceLogs };
  }
}
