import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CorrectVendorAdvanceInput } from '@azentisfieldos/shared';
import { PrismaService } from '../prisma/prisma.service';

// Append-only (AD-9). Unlike Advance/AdvanceAdjustment (Team Members),
// there is no materialized Outstanding Balance to keep in sync for a
// Vendor — this is a plain ledger row, always created inline from the
// Waste Disposal entry that occasioned it (WasteDisposalService.create,
// in the same transaction — writes go straight through `tx.vendorAdvance`
// there, the same convention PaymentsService already uses for
// AdvanceAdjustment, rather than threading a transaction client through a
// second injected service). The only write this service itself performs is
// a correction of an existing row (a wrongly-entered amount/payment method),
// since there is no standalone "record an advance" surface.
@Injectable()
export class VendorAdvancesService {
  constructor(private readonly prisma: PrismaService) {}

  // The Vendor detail page's Vendor Advances section — always orders by
  // givenAt desc, same convention as every other per-Vendor history list
  // (Purchase History, Waste & Disposal History).
  list(vendorId: string) {
    return this.prisma.vendorAdvance.findMany({
      where: { vendorId },
      include: { wasteDisposal: { select: { id: true, wasteType: true } } },
      orderBy: { givenAt: 'desc' },
    });
  }

  // The correction form needs the original Advance's fields to pre-fill
  // from — same reasoning as every other correctable entity's findOne.
  async findOne(id: string) {
    const advance = await this.prisma.vendorAdvance.findUnique({
      where: { id },
      include: { wasteDisposal: { select: { id: true, wasteType: true } } },
    });
    if (!advance) {
      throw new NotFoundException(`Vendor Advance ${id} not found`);
    }
    return advance;
  }

  // A signed-delta correction row (AD-9) — vendorId/wasteDisposalId/givenAt
  // are inherited from the original (never corrected to a different Vendor
  // or trip; `givenAt` has no separate "corrected date" concept here), only
  // amount and paymentMethod can actually change.
  async correct(input: CorrectVendorAdvanceInput) {
    const original = await this.prisma.vendorAdvance.findUnique({
      where: { id: input.correctsId },
    });
    if (!original) {
      throw new BadRequestException(
        `Vendor Advance ${input.correctsId} does not exist`,
      );
    }
    return this.prisma.vendorAdvance.create({
      data: {
        vendorId: original.vendorId,
        wasteDisposalId: original.wasteDisposalId,
        amount: input.amount,
        paymentMethod: input.paymentMethod ?? original.paymentMethod,
        givenAt: original.givenAt,
        correctsId: input.correctsId,
        correctionReason: input.reason,
      },
    });
  }
}
