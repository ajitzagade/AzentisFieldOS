import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Append-only (AD-9). Unlike Advance/AdvanceAdjustment (Team Members),
// there is no materialized Outstanding Balance to keep in sync for a
// Vendor — this is a plain ledger row, always created inline from the
// Waste Disposal entry that occasioned it (WasteDisposalService.create,
// in the same transaction — writes go straight through `tx.vendorAdvance`
// there, the same convention PaymentsService already uses for
// AdvanceAdjustment, rather than threading a transaction client through a
// second injected service). This service only ever reads.
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
}
