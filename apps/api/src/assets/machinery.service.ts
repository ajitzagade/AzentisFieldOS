import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateMachineryInput,
  UpdateMachineryInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// FR-15: Owner/Admin creates and maintains the Machinery register.
// `currentStatus`/`currentSiteId` are exclusively written by Story 8.2's
// movement-recording transaction — never accepted here, and
// createMachinerySchema/updateMachinerySchema (AD-7) already exclude them
// from the validated body, so `input` can never carry them even if a
// caller sends them.
@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMachineryInput) {
    try {
      return await this.prisma.machinery.create({
        data: input,
        include: { type: true, currentSite: true },
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // Type and current Site joined in for the register list's columns
  // (story 8.1 Task 4) without a second round-trip per row.
  list() {
    return this.prisma.machinery.findMany({
      include: { type: true, currentSite: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const machinery = await this.prisma.machinery.findUnique({
      where: { id },
      include: { type: true, currentSite: true },
    });
    if (!machinery) {
      throw new NotFoundException(`Machinery ${id} not found`);
    }
    return machinery;
  }

  // Master data — a normal in-place update (AC #3), not one of AD-9's
  // append-only transaction-history tables.
  async update(id: string, input: UpdateMachineryInput) {
    try {
      return await this.prisma.machinery.update({
        where: { id },
        data: input,
        include: { type: true, currentSite: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Machinery ${id} not found`);
      }
      throw this.translateWriteError(error);
    }
  }

  // A typeId that doesn't exist (P2003) or a duplicate assetNumber
  // (P2002, @unique) must be a clean 400, not a raw 500 — same pattern as
  // MaterialsService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return new BadRequestException(
          'This Machine references a Machinery Type that does not exist',
        );
      }
      if (error.code === 'P2002') {
        return new BadRequestException(
          'A Machine with this Asset Number already exists',
        );
      }
    }
    return error;
  }
}
