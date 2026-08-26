import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ReportContent } from './report-compiler.service';
import {
  EMAIL_SENDER,
  WHATSAPP_SENDER,
  type EmailSender,
  type WhatsAppSender,
} from './report-senders';

// Story 13.1 (FR-33): per-channel delivery + retry. Every DailyReport is
// delivered with NO manual "Send" action (AC #2, UX-DR19); failures surface
// in-app as a visible status, never silently dropped (AC #3).

// The default enabled-channels set. WHATSAPP is deliberately excluded until a
// real BSP adapter exists (see report-senders.ts). FR-50's full "which
// channels, to whom" configuration is Epic 14 — this is the scoped, sensible
// day-one default.
export const ENABLED_CHANNELS = ['IN_APP', 'EMAIL'] as const;
export type DeliveryChannel = (typeof ENABLED_CHANNELS)[number] | 'WHATSAPP';

// Retry policy: up to 3 total attempts per (report, channel). Each send() call
// is exactly one attempt. The first attempt happens inline when the report is
// compiled; subsequent attempts come from the retry-sweep Cron re-calling the
// same idempotent send() (the simpler of the two options the story allows,
// vs. in-process backoff inside one time-limited serverless invocation).
export const MAX_DELIVERY_ATTEMPTS = 3;

@Injectable()
export class ReportDeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
    @Inject(WHATSAPP_SENDER) private readonly whatsAppSender: WhatsAppSender,
  ) {}

  // Creates a ReportDelivery row for each enabled channel that doesn't already
  // have one for this report, then attempts each once. Idempotent by
  // construction: the fast path skips channels that already have a row, and the
  // `@@unique([dailyReportId, channel])` constraint closes the check-then-act
  // race — a create that loses to a concurrent run / re-run raises P2002, which
  // is caught and treated as "already exists / skip send". The invariant: a
  // second ensureDeliveries call for the same report creates zero new rows and
  // triggers zero sends, so a Cron re-run or `?date=` backfill never
  // double-delivers.
  async ensureDeliveries(dailyReportId: string) {
    const existing = await this.prisma.reportDelivery.findMany({
      where: { dailyReportId },
      select: { channel: true },
    });
    const existingChannels = new Set(existing.map((row) => row.channel));

    for (const channel of ENABLED_CHANNELS) {
      if (existingChannels.has(channel)) continue;
      let deliveryId: string;
      try {
        const delivery = await this.prisma.reportDelivery.create({
          data: { dailyReportId, channel },
        });
        deliveryId = delivery.id;
      } catch (error) {
        // Lost the race: the unique (report, channel) row already exists.
        // Skip — the winner owns the first send, the retry sweep owns retries.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          continue;
        }
        throw error;
      }
      // One Site's delivery failure must never abort the whole Cron run —
      // send() catches its own errors, so this never throws.
      await this.send(deliveryId);
    }
  }

  // Re-attempts every delivery still PENDING and under the attempt cap. The
  // retry-sweep Cron's entry point (idempotent, reuses send()).
  async retryPending() {
    const pending = await this.prisma.reportDelivery.findMany({
      where: { status: 'PENDING', attempts: { lt: MAX_DELIVERY_ATTEMPTS } },
      select: { id: true },
    });
    for (const delivery of pending) {
      await this.send(delivery.id);
    }
    return { retried: pending.length };
  }

  // One delivery attempt. Never throws — a failure is recorded on the row
  // (attempts/lastError, and status FAILED once the cap is hit) so it surfaces
  // in-app (AC #3). Already-completed rows (SENT/FAILED) are a no-op, so a 4th
  // attempt is never made after the 3rd failure.
  async send(deliveryId: string) {
    const delivery = await this.prisma.reportDelivery.findUnique({
      where: { id: deliveryId },
      include: { dailyReport: true },
    });
    if (!delivery) return;
    if (delivery.status === 'SENT' || delivery.status === 'FAILED') return;

    try {
      await this.dispatch(
        delivery.channel,
        delivery.dailyReport.content as unknown as ReportContent,
      );
      await this.prisma.reportDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'SENT',
          deliveredAt: new Date(),
          attempts: delivery.attempts + 1,
          lastError: null,
        },
      });
    } catch (error) {
      const attempts = delivery.attempts + 1;
      const message = error instanceof Error ? error.message : String(error);
      const exhausted = attempts >= MAX_DELIVERY_ATTEMPTS;
      await this.prisma.reportDelivery.update({
        where: { id: deliveryId },
        data: {
          attempts,
          lastError: message,
          status: exhausted ? 'FAILED' : 'PENDING',
        },
      });
    }
  }

  // Per-channel send logic. IN_APP has no external call — the report simply
  // existing and being viewable in the product IS in-app delivery.
  private async dispatch(channel: string, content: ReportContent) {
    switch (channel) {
      case 'IN_APP':
        return;
      case 'EMAIL': {
        const recipients = await this.ownerAdminEmails();
        if (recipients.length === 0) {
          throw new Error('No Owner/Admin recipients configured for email');
        }
        await this.emailSender.send(recipients, content);
        return;
      }
      case 'WHATSAPP':
        await this.whatsAppSender.send([], content);
        return;
      default:
        throw new Error(`Unknown delivery channel: ${channel}`);
    }
  }

  // EMAIL goes to every Owner/Admin (FR-50's full recipient configuration is
  // Epic 14 — this is the scoped default: notify the Owner/Admins, not an open
  // list).
  private async ownerAdminEmails(): Promise<string[]> {
    const owners = await this.prisma.user.findMany({
      where: { role: 'OWNER_ADMIN' },
      select: { email: true },
    });
    return owners.map((owner) => owner.email);
  }
}
