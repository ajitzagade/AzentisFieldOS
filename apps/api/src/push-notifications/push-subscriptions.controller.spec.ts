import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { createPushSubscriptionSchema } from '@azentisfieldos/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushNotificationsService } from './push-notifications.service';

function makeController() {
  const service = {
    subscribe: vi.fn().mockResolvedValue(undefined),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
  };
  const controller = new PushSubscriptionsController(
    service as unknown as PushNotificationsService,
  );
  return { controller, service };
}

const authUser = { id: 'u1', role: 'SITE_SUPERVISOR' as const };

describe('PushSubscriptionsController', () => {
  it('subscribe delegates to the service with the acting user id and the subscription fields', async () => {
    const { controller, service } = makeController();
    const body = {
      endpoint: 'https://push.example/abc',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
    };

    const result = await controller.subscribe(authUser, body);

    expect(service.subscribe).toHaveBeenCalledWith(
      'u1',
      body.endpoint,
      'p256dh-key',
      'auth-key',
    );
    expect(result).toEqual({ ok: true });
  });

  it('unsubscribe delegates to the service with the endpoint and the acting user id', async () => {
    const { controller, service } = makeController();

    const result = await controller.unsubscribe(authUser, {
      endpoint: 'https://push.example/abc',
    });

    expect(service.unsubscribe).toHaveBeenCalledWith(
      'https://push.example/abc',
      'u1',
    );
    expect(result).toEqual({ ok: true });
  });
});

// Guards against SSRF: apps/api later POSTs directly to this URL
// (web-push), so only known browser push-service hosts are accepted.
describe('ZodValidationPipe(createPushSubscriptionSchema)', () => {
  const pipe = new ZodValidationPipe(createPushSubscriptionSchema);
  const keys = { p256dh: 'p256dh-key', auth: 'auth-key' };

  it('accepts a real FCM endpoint', () => {
    expect(() =>
      pipe.transform({
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
        keys,
      }),
    ).not.toThrow();
  });

  it('accepts a real Mozilla push endpoint', () => {
    expect(() =>
      pipe.transform({
        endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/abc123',
        keys,
      }),
    ).not.toThrow();
  });

  it('rejects an endpoint on a host outside the known push-service allowlist', () => {
    expect(() =>
      pipe.transform({
        endpoint: 'http://169.254.169.254/latest/meta-data/',
        keys,
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects a lookalike host that merely contains an allowed host as a substring', () => {
    expect(() =>
      pipe.transform({
        endpoint: 'https://fcm.googleapis.com.attacker.example/abc',
        keys,
      }),
    ).toThrow(BadRequestException);
  });
});
