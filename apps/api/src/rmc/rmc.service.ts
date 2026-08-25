import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Read-only for now — RmcEntry rows are written exclusively through
// DsrService's transaction (Epic 3's DSR-embedded rmcEntries array).
// Epic 10 owns a dedicated "record an RMC delivery" write path; this list
// endpoint exists so the RMC nav item has something real to show before
// that lands.
@Injectable()
export class RmcService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.rmcEntry.findMany({
      include: { site: true, vendor: true },
      orderBy: { deliveredAt: 'desc' },
    });
  }
}
