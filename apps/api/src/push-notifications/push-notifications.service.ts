import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../generated/prisma/client';

export interface PushPayload {
  title: string;
  body: string;
  // Path apps/web's service worker opens/focuses on notification click,
  // e.g. "/sites/abc" — omit for a payload with nowhere useful to land.
  url?: string;
}

interface StoredSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Web Push (VAPID) — no Firebase/FCM, no vendor account, no per-message
// cost. `web-push` just encrypts the payload per the Push API spec; the
// browser vendor's own relay (which happens to be FCM under the hood for
// Chrome, APNs for Safari) delivers it, entirely outside this codebase.
// This is a best-effort supplementary channel, not FR-33's report-delivery
// guarantee: one device's failure is logged and dropped, never retried,
// and never blocks the write that triggered it.
@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private readonly configured: boolean;

  constructor(private readonly prisma: PrismaService) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    this.configured = Boolean(publicKey && privateKey && subject);
    if (this.configured) {
      webpush.setVapidDetails(
        subject as string,
        publicKey as string,
        privateKey as string,
      );
    }
  }

  // Upsert-by-endpoint: the same browser install re-subscribing (e.g. after
  // clearing the DB, or a second tab) gets its keys refreshed in place
  // rather than creating a duplicate row.
  async subscribe(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
  ): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth },
      update: { userId, p256dh, auth },
    });
  }

  // Scoped to the calling user's own row: deleting a subscription is only
  // ever a device unregistering itself, never a way to reach into another
  // user's rows — a caller who submits someone else's endpoint (learned by
  // whatever means) simply deletes nothing.
  async unsubscribe(endpoint: string, userId: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({
      where: { endpoint, userId },
    });
  }

  // Every call site fires this without awaiting or catching it — a DB
  // error here (e.g. a transient connection blip) must never become an
  // unhandled promise rejection, so it's caught and logged internally
  // rather than left to the caller.
  async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    if (userIds.length === 0) {
      return;
    }
    if (!this.configured) {
      this.logger.warn(
        'Push not configured (VAPID_* env vars missing) — skipping send',
      );
      return;
    }
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: { in: userIds } },
      });
      await Promise.all(
        subscriptions.map((subscription) =>
          this.sendOne(subscription, payload),
        ),
      );
    } catch (error) {
      this.logger.warn(`sendToUsers failed: ${String(error)}`);
    }
  }

  // `excludeUserId` skips notifying the very user whose own action
  // triggered this send (e.g. an Owner/Admin recording a Payment doesn't
  // need a push confirming what they just did themselves) — most useful
  // for OWNER_ADMIN-only actions, where every recipient would otherwise
  // include the actor. Same fire-and-forget-safety reasoning as
  // sendToUsers above — never lets a lookup failure become an unhandled
  // rejection at a call site.
  async sendToRole(
    role: Role,
    payload: PushPayload,
    excludeUserId?: string,
  ): Promise<void> {
    try {
      const users = await this.prisma.user.findMany({
        where: { role },
        select: { id: true },
      });
      const userIds = users
        .map((u) => u.id)
        .filter((id) => id !== excludeUserId);
      await this.sendToUsers(userIds, payload);
    } catch (error) {
      this.logger.warn(`sendToRole(${role}) failed: ${String(error)}`);
    }
  }

  private async sendOne(
    subscription: StoredSubscription,
    payload: PushPayload,
  ): Promise<void> {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
      );
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // The push service itself confirms this registration is dead
        // (uninstalled, permission revoked, browser data cleared) — prune
        // it rather than retrying forever against an endpoint that will
        // never accept another message.
        await this.prisma.pushSubscription
          .delete({ where: { id: subscription.id } })
          .catch(() => undefined);
        return;
      }
      this.logger.warn(
        `Push delivery failed for subscription ${subscription.id}: ${String(error)}`,
      );
    }
  }
}
