import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ConfirmMovementReceiptInput,
  CreateMovementInput,
} from '@azentisfieldos/shared';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decrementStockWithFloorCheck } from './stock-delta';

// FR-9: Owner/Admin records a Godown-to-Site (and, from Story 5.4,
// Site-to-Site) Movement in two steps — sent now, received on confirmation.
@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateMovementInput) {
    if (input.correctsId) {
      const original = await this.prisma.movement.findUnique({
        where: { id: input.correctsId },
      });
      if (!original) {
        throw new BadRequestException(
          `Movement ${input.correctsId} does not exist`,
        );
      }
      // The correction form locks/hides these fields client-side, but
      // that's a UI convenience, not enforcement — a correction must stay
      // tied to the same kind/Material Size/Site(s) as the Movement it
      // corrects, or its quantity delta would apply to the wrong balance.
      if (
        original.kind !== input.kind ||
        original.materialSizeId !== input.materialSizeId ||
        original.sourceSiteId !== (input.sourceSiteId ?? null) ||
        original.destinationSiteId !== input.destinationSiteId
      ) {
        throw new BadRequestException(
          "A correction's kind, Material Size, and Site(s) must match the Movement it corrects",
        );
      }
    }

    const isGodownToSite = input.kind === 'GODOWN_TO_SITE';

    try {
      return await this.prisma.$transaction(async (tx) => {
        const movement = await tx.movement.create({
          data: { ...input, movedAt: new Date(input.movedAt) },
        });

        // Story 5.2's canonical floor check (extracted in Story 5.5 once a
        // third call site needed it) targets Godown (GODOWN_TO_SITE) or
        // the sending Site (SITE_TO_SITE) — same technique, different
        // target.
        await decrementStockWithFloorCheck(
          tx,
          isGodownToSite
            ? { model: 'godownStock', materialSizeId: input.materialSizeId }
            : {
                model: 'siteStock',
                siteId: input.sourceSiteId!,
                materialSizeId: input.materialSizeId,
              },
          input.sentQuantity,
          isGodownToSite
            ? 'Not enough Godown Stock for this Movement.'
            : "Not enough of the source Site's Stock for this Movement.",
        );

        return movement;
      });
    } catch (error) {
      throw this.translateWriteError(error);
    }
  }

  // AC #2: the receiving Site confirms what actually arrived — completing
  // the same event, not correcting a mistake (Dev Notes "Why confirmReceipt
  // updates a row"). Site Stock increases by receivedQuantity, never by
  // sentQuantity — a shortage/damage gap stays visible, never absorbed.
  async confirmReceipt(id: string, input: ConfirmMovementReceiptInput) {
    const movement = await this.prisma.movement.findUnique({ where: { id } });
    if (!movement) {
      throw new NotFoundException(`Movement ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // A plain findUnique-then-update has a race window: two concurrent
      // confirmReceipt calls can both read receivedQuantity: null before
      // either commits, both pass the "not yet confirmed" check, and both
      // increment SiteStock — double-counting a shortage/damage gap into
      // the balance while the Movement row itself only ever shows the
      // second caller's value. updateMany's WHERE-clause guard (the same
      // technique decrementStockWithFloorCheck uses) makes the check and
      // the write atomic: only one concurrent caller's updateMany can
      // affect a row, so only one can proceed to the SiteStock increment.
      const result = await tx.movement.updateMany({
        where: { id, receivedQuantity: null },
        data: { receivedQuantity: input.receivedQuantity },
      });
      if (result.count === 0) {
        throw new BadRequestException(
          `Movement ${id} has already had its receipt confirmed`,
        );
      }

      await tx.siteStock.upsert({
        where: {
          siteId_materialSizeId: {
            siteId: movement.destinationSiteId,
            materialSizeId: movement.materialSizeId,
          },
        },
        update: { quantity: { increment: input.receivedQuantity } },
        create: {
          siteId: movement.destinationSiteId,
          materialSizeId: movement.materialSizeId,
          quantity: input.receivedQuantity,
        },
      });

      return tx.movement.findUniqueOrThrow({ where: { id } });
    });
  }

  list() {
    return this.prisma.movement.findMany({
      include: {
        sourceSite: true,
        destinationSite: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
      orderBy: { movedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const movement = await this.prisma.movement.findUnique({
      where: { id },
      include: {
        sourceSite: true,
        destinationSite: true,
        materialSize: { include: { material: { include: { unit: true } } } },
      },
    });
    if (!movement) {
      throw new NotFoundException(`Movement ${id} not found`);
    }
    return movement;
  }

  // A materialSizeId/sourceSiteId/destinationSiteId that doesn't exist
  // must be a clean 400, not a raw 500 — same pattern as
  // PurchasesService.translateWriteError.
  private translateWriteError(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return new BadRequestException(
        'This Movement references a Material Size or Site that does not exist',
      );
    }
    return error;
  }
}
