import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PushNotificationsService } from './push-notifications.service';

const setVapidDetails =
  vi.fn<(subject: string, publicKey: string, privateKey: string) => void>();
const sendNotification =
  vi.fn<(subscription: unknown, payload: string) => Promise<unknown>>();

// vi.mock's factory is hoisted above both imports AND the setVapidDetails/
// sendNotification const declarations by Vitest's transform — referencing
// them directly here (rather than through a wrapper called later, at
// invocation time) hits the TDZ ("cannot access before initialization").
// The wrapper defers the reference to call time; the explicit vi.fn<...>()
// generics above (not an annotation on the wrapper itself) are what satisfy
// no-unsafe-return, since the rule inspects the returned expression's own
// type, not the wrapper's declared return type.
vi.mock('web-push', () => ({
  setVapidDetails: (...args: Parameters<typeof setVapidDetails>) =>
    setVapidDetails(...args),
  sendNotification: (...args: Parameters<typeof sendNotification>) =>
    sendNotification(...args),
}));

const originalEnv = { ...process.env };

function makeService(
  overrides: {
    findManySubscriptions?: ReturnType<typeof vi.fn>;
    findManyUsers?: ReturnType<typeof vi.fn>;
    deleteSubscription?: ReturnType<typeof vi.fn>;
  } = {},
) {
  const upsert = vi.fn().mockResolvedValue(undefined);
  const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
  const findMany =
    overrides.findManySubscriptions ?? vi.fn().mockResolvedValue([]);
  const deleteOne =
    overrides.deleteSubscription ?? vi.fn().mockResolvedValue(undefined);
  const findManyUsers =
    overrides.findManyUsers ?? vi.fn().mockResolvedValue([]);

  const prisma = {
    pushSubscription: { upsert, deleteMany, findMany, delete: deleteOne },
    user: { findMany: findManyUsers },
  };
  const service = new PushNotificationsService(
    prisma as unknown as ConstructorParameters<
      typeof PushNotificationsService
    >[0],
  );
  return {
    service,
    prisma,
    upsert,
    deleteMany,
    findMany,
    deleteOne,
    findManyUsers,
  };
}

describe('PushNotificationsService', () => {
  beforeEach(() => {
    process.env.VAPID_PUBLIC_KEY = 'pub';
    process.env.VAPID_PRIVATE_KEY = 'priv';
    process.env.VAPID_SUBJECT = 'mailto:test@example.com';
    setVapidDetails.mockClear();
    sendNotification.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it('configures web-push with VAPID details when all three env vars are set', () => {
    makeService();
    expect(setVapidDetails).toHaveBeenCalledWith(
      'mailto:test@example.com',
      'pub',
      'priv',
    );
  });

  it('does not call web-push at all when VAPID env vars are missing', () => {
    delete process.env.VAPID_PRIVATE_KEY;
    makeService();
    expect(setVapidDetails).not.toHaveBeenCalled();
  });

  it('subscribe upserts by endpoint', async () => {
    const { service, upsert } = makeService();
    await service.subscribe(
      'u1',
      'https://push.example/abc',
      'p256dh-key',
      'auth-key',
    );
    expect(upsert).toHaveBeenCalledWith({
      where: { endpoint: 'https://push.example/abc' },
      create: {
        userId: 'u1',
        endpoint: 'https://push.example/abc',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      },
      update: { userId: 'u1', p256dh: 'p256dh-key', auth: 'auth-key' },
    });
  });

  it('unsubscribe deletes by endpoint scoped to the calling user', async () => {
    const { service, deleteMany } = makeService();
    await service.unsubscribe('https://push.example/abc', 'u1');
    expect(deleteMany).toHaveBeenCalledWith({
      where: { endpoint: 'https://push.example/abc', userId: 'u1' },
    });
  });

  it('sendToUsers is a no-op when the user list is empty (no DB query, no send)', async () => {
    const { service, findMany } = makeService();
    await service.sendToUsers([], { title: 't', body: 'b' });
    expect(findMany).not.toHaveBeenCalled();
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('sendToUsers skips sending (but does not throw) when VAPID is not configured', async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    const { service, findMany } = makeService();
    await expect(
      service.sendToUsers(['u1'], { title: 't', body: 'b' }),
    ).resolves.toBeUndefined();
    expect(findMany).not.toHaveBeenCalled();
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('sendToUsers sends to every stored subscription for the given users', async () => {
    const { service, findMany } = makeService({
      findManySubscriptions: vi.fn().mockResolvedValue([
        {
          id: 'sub1',
          endpoint: 'https://push.example/1',
          p256dh: 'p1',
          auth: 'a1',
        },
        {
          id: 'sub2',
          endpoint: 'https://push.example/2',
          p256dh: 'p2',
          auth: 'a2',
        },
      ]),
    });

    await service.sendToUsers(['u1', 'u2'], {
      title: 'Hello',
      body: 'World',
      url: '/somewhere',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['u1', 'u2'] } },
    });
    expect(sendNotification).toHaveBeenCalledTimes(2);
    expect(sendNotification).toHaveBeenCalledWith(
      {
        endpoint: 'https://push.example/1',
        keys: { p256dh: 'p1', auth: 'a1' },
      },
      JSON.stringify({ title: 'Hello', body: 'World', url: '/somewhere' }),
    );
  });

  it('prunes a subscription whose push service returns 410 Gone, without throwing', async () => {
    sendNotification.mockRejectedValueOnce(
      Object.assign(new Error('gone'), { statusCode: 410 }),
    );
    const { service, deleteOne } = makeService({
      findManySubscriptions: vi.fn().mockResolvedValue([
        {
          id: 'dead-sub',
          endpoint: 'https://push.example/dead',
          p256dh: 'p',
          auth: 'a',
        },
      ]),
    });

    await expect(
      service.sendToUsers(['u1'], { title: 't', body: 'b' }),
    ).resolves.toBeUndefined();

    expect(deleteOne).toHaveBeenCalledWith({ where: { id: 'dead-sub' } });
  });

  it('logs and swallows a non-410/404 delivery failure — one bad device never throws', async () => {
    sendNotification.mockRejectedValueOnce(new Error('network blip'));
    const { service, deleteOne } = makeService({
      findManySubscriptions: vi.fn().mockResolvedValue([
        {
          id: 'sub1',
          endpoint: 'https://push.example/1',
          p256dh: 'p',
          auth: 'a',
        },
      ]),
    });

    await expect(
      service.sendToUsers(['u1'], { title: 't', body: 'b' }),
    ).resolves.toBeUndefined();
    expect(deleteOne).not.toHaveBeenCalled();
  });

  it('sendToRole queries users by role and excludes the acting user when given', async () => {
    const { service, findManyUsers, findMany } = makeService({
      findManyUsers: vi
        .fn()
        .mockResolvedValue([{ id: 'owner1' }, { id: 'owner2' }]),
    });

    await service.sendToRole(
      'OWNER_ADMIN',
      { title: 't', body: 'b' },
      'owner1',
    );

    expect(findManyUsers).toHaveBeenCalledWith({
      where: { role: 'OWNER_ADMIN' },
      select: { id: true },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: { in: ['owner2'] } },
    });
  });

  // Every call site fires these fire-and-forget (`void this.pushNotifications
  // .sendToRole(...)`) with no .catch — a DB failure here must never become
  // an unhandled promise rejection.
  it('sendToRole never throws when the user lookup itself fails', async () => {
    const { service } = makeService({
      findManyUsers: vi.fn().mockRejectedValue(new Error('db down')),
    });

    await expect(
      service.sendToRole('OWNER_ADMIN', { title: 't', body: 'b' }),
    ).resolves.toBeUndefined();
  });

  it('sendToUsers never throws when the subscription lookup itself fails', async () => {
    const { service, findMany } = makeService({
      findManySubscriptions: vi.fn().mockRejectedValue(new Error('db down')),
    });

    await expect(
      service.sendToUsers(['u1'], { title: 't', body: 'b' }),
    ).resolves.toBeUndefined();
    expect(findMany).toHaveBeenCalled();
  });
});
