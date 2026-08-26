import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  CreateAssetMovementInput,
  ReportDateRange,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { dateRangeBounds } from '../common/date-range';

// FR-17, FR-38: records a Machine/Vehicle's movement to a new Site or to
// Maintenance/Available, and — in the same transaction as the append-only
// log insert — re-derives the parent asset's materialized currentStatus/
// currentSiteId from whatever row was just inserted. This mirrors Epic 5
// Story 5.2's GodownStock/SiteStock materialization pattern, just for a
// status+location pair instead of a quantity.
//
// A correcting movement (correctsId set) is a full restatement of
// toStatus/siteId, not a delta (see the Dev Notes on
// _bmad-output/implementation-artifacts/8-2-record-movement-between-sites-maintenance.md
// "Why this correction is a restatement, not a delta"). Because
// currentStatus/currentSiteId are always re-derived from the row that was
// just inserted — correction or not — no special-case branch is needed
// here: a correction's toStatus/siteId simply become the new current
// state, exactly like an ordinary movement would.
@Injectable()
export class AssetMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAssetMovementInput) {
    const currentSiteId =
      input.toStatus === 'AT_SITE' ? (input.siteId ?? null) : null;

    if (input.correctsId) {
      const original =
        input.assetType === 'MACHINERY'
          ? await this.prisma.machineryMovementLog.findUnique({
              where: { id: input.correctsId },
            })
          : await this.prisma.vehicleMovementLog.findUnique({
              where: { id: input.correctsId },
            });

      if (!original) {
        throw new BadRequestException(
          `Movement ${input.correctsId} does not exist`,
        );
      }

      // A correction must stay tied to the same asset as the movement it
      // corrects, or currentStatus/currentSiteId would be re-derived onto
      // the wrong Machine/Vehicle.
      const originalAssetId =
        input.assetType === 'MACHINERY'
          ? (original as { machineryId: string }).machineryId
          : (original as { vehicleId: string }).vehicleId;
      if (originalAssetId !== input.assetId) {
        throw new BadRequestException(
          "A correction's asset must match the Movement it corrects",
        );
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        if (input.assetType === 'MACHINERY') {
          const log = await tx.machineryMovementLog.create({
            data: {
              machineryId: input.assetId,
              toStatus: input.toStatus,
              siteId: currentSiteId,
              movedAt: input.movedAt,
              correctsId: input.correctsId,
              reason: input.reason,
            },
            include: { site: true },
          });

          await tx.machinery.update({
            where: { id: input.assetId },
            data: { currentStatus: input.toStatus, currentSiteId },
          });

          return log;
        }

        const log = await tx.vehicleMovementLog.create({
          data: {
            vehicleId: input.assetId,
            toStatus: input.toStatus,
            siteId: currentSiteId,
            movedAt: input.movedAt,
            correctsId: input.correctsId,
            reason: input.reason,
          },
          include: { site: true },
        });

        await tx.vehicle.update({
          where: { id: input.assetId },
          data: { currentStatus: input.toStatus, currentSiteId },
        });

        return log;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // GET /asset-movements?assetType=&assetId= — the asset detail page's
  // reverse-chronological "Movement History" section. Story 13.3 (FR-45): the
  // Machinery/Vehicle Reports view reuses this same query, adding an optional
  // `movedAt` date window. Unfiltered (the default `{}`) `dateRangeBounds`
  // returns `undefined`, which Prisma reads as no constraint, so the `where`
  // is byte-identical to the pre-13.3 asset detail query.
  list(
    assetType: 'MACHINERY' | 'VEHICLE',
    assetId: string,
    filters: ReportDateRange = {},
  ) {
    const movedAt = dateRangeBounds(filters.from, filters.to);
    if (assetType === 'MACHINERY') {
      return this.prisma.machineryMovementLog.findMany({
        where: { machineryId: assetId, movedAt },
        include: { site: true },
        orderBy: { movedAt: 'desc' },
      });
    }
    return this.prisma.vehicleMovementLog.findMany({
      where: { vehicleId: assetId, movedAt },
      include: { site: true },
      orderBy: { movedAt: 'desc' },
    });
  }

  // An assetId or siteId that doesn't exist (P2003) must be a clean 400,
  // not a raw 500 — same pattern as MachineryService/VehicleService.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Movement references a Machine/Vehicle or Site that does not exist',
      );
    }
    return error;
  }
}
