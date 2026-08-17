import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateAssetServiceLogInput,
  UpdateAssetServiceLogInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-18: fuel/maintenance/repair entries per Machine/Vehicle — purely
// additive history. Unlike Story 8.2's AssetMovementsService, there is no
// materialized current-state column on Machinery/Vehicle derived from
// this table, so no transaction/re-derivation step is needed here — a
// plain create/update against whichever Prisma delegate assetType picks
// is enough. Same MachineryServiceLog/VehicleServiceLog
// branching-on-assetType pattern Story 8.2 established (AD-7). AC #2: no
// correction lifecycle — `update` is a normal in-place edit, never a
// CorrectAction.
@Injectable()
export class AssetServiceLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateAssetServiceLogInput) {
    try {
      if (input.assetType === 'MACHINERY') {
        return await this.prisma.machineryServiceLog.create({
          data: {
            machineryId: input.assetId,
            kind: input.kind,
            notes: input.notes,
            cost: input.cost,
            serviceDate: input.serviceDate,
          },
        });
      }
      return await this.prisma.vehicleServiceLog.create({
        data: {
          vehicleId: input.assetId,
          kind: input.kind,
          notes: input.notes,
          cost: input.cost,
          serviceDate: input.serviceDate,
        },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // GET /asset-service-logs?assetType=&assetId= — the asset detail page's
  // "Service History" section (AC #1: retrievable in full at any time).
  list(assetType: 'MACHINERY' | 'VEHICLE', assetId: string) {
    if (assetType === 'MACHINERY') {
      return this.prisma.machineryServiceLog.findMany({
        where: { machineryId: assetId },
        orderBy: { serviceDate: 'desc' },
      });
    }
    return this.prisma.vehicleServiceLog.findMany({
      where: { vehicleId: assetId },
      orderBy: { serviceDate: 'desc' },
    });
  }

  // AC #2: a normal in-place update, same as Material/Team Member
  // master-data edits — no correctsId/reason, this model has no
  // correction lifecycle.
  async update(
    id: string,
    assetType: 'MACHINERY' | 'VEHICLE',
    input: UpdateAssetServiceLogInput,
  ) {
    try {
      if (assetType === 'MACHINERY') {
        return await this.prisma.machineryServiceLog.update({
          where: { id },
          data: input,
        });
      }
      return await this.prisma.vehicleServiceLog.update({
        where: { id },
        data: input,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Service Log ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // An assetId that doesn't exist (P2003) must be a clean 400, not a raw
  // 500 — same pattern as AssetMovementsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Service Log entry references a Machine/Vehicle that does not exist',
      );
    }
    return error;
  }
}
