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

// Story 14.4 (FR-50): the enabled channels and their recipients are no longer
// hardcoded here — they are read from NotificationChannelSetting. The seed
// (infra/prisma/seed.ts) initialises exactly the three rows Story 13.1's
// hardcoded default implied (EMAIL + IN_APP enabled, WHATSAPP disabled), so
// this switch does not change day-one delivery behaviour. ENABLED_CHANNELS
// remains only as the documented seed default, not as the runtime source.
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

    // Story 14.4: the enabled channel set is admin configuration now, read from
    // NotificationChannelSetting. A channel toggled off here creates no
    // ReportDelivery row (and therefore never sends) on the next compile.
    const enabled = await this.prisma.notificationChannelSetting.findMany({
      where: { enabled: true },
      select: { channel: true },
    });

    for (const { channel } of enabled) {
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
        const recipients = await this.recipientEmailsFor('EMAIL');
        if (recipients.length === 0) {
          throw new Error('No recipients configured for email');
        }
        await this.emailSender.send(recipients, content);
        return;
      }
      case 'WHATSAPP':
        // The BSP adapter is still the not-configured placeholder (Story 13.1):
        // attempting delivery records the honest failure in-app. Recipients are
        // irrelevant to the placeholder, so none are resolved here.
        await this.whatsAppSender.send([], content);
        return;
      default:
        throw new Error(`Unknown delivery channel: ${channel}`);
    }
  }

  // Story 14.4 (FR-50): a channel's recipients are the emails of the Users named
  // in its NotificationChannelSetting.recipientUserIds — no longer every
  // Owner/Admin. The seed initialises EMAIL's recipients to the current
  // Owner/Admin ids, so day-one behaviour is unchanged; an admin can then edit
  // the list and it is honoured on the very next run.
  private async recipientEmailsFor(channel: string): Promise<string[]> {
    const setting = await this.prisma.notificationChannelSetting.findUnique({
      where: { channel },
    });
    const ids = setting?.recipientUserIds ?? [];
    return this.emailsForUserIds(ids);
  }

  private async emailsForUserIds(ids: string[]): Promise<string[]> {
    if (ids.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { email: true },
    });
    return users.map((user) => user.email);
  }

  // Story 14.5 (FR-51): deliver a SCHEDULED (non-DSR) report to a ReportSchedule's
  // own recipient list, reusing this service's existing Email sender adapter (no
  // second delivery mechanism). Deliberately INDEPENDENT of the daily-DSR path:
  // it creates NO DailyReport/ReportDelivery rows and reads NO
  // NotificationChannelSetting — a ReportSchedule carries its own recipients, so
  // FR-51's "independent of FR-50" is satisfied structurally. Recipients are
  // resolved by user id (the same emailsForUserIds helper), never by role or by
  // the daily channel config. Returns the number of recipients emailed so the
  // Cron handler can report it.
  async deliverScheduledReport(
    recipientUserIds: string[],
    content: ReportContent,
  ): Promise<{ recipients: number }> {
    const recipients = await this.emailsForUserIds(recipientUserIds);
    if (recipients.length > 0) {
      await this.emailSender.send(recipients, content);
    }
    return { recipients: recipients.length };
  }
}
