import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import {
  MAX_DELIVERY_ATTEMPTS,
  ReportDeliveryService,
} from './report-delivery.service';
import type { EmailSender, WhatsAppSender } from './report-senders';

interface DeliveryRow {
  id: string;
  channel: string;
  status: string;
  attempts: number;
  lastError: string | null;
  deliveredAt: Date | null;
}

function makeHarness(options: {
  delivery: DeliveryRow;
  emailSend?: ReturnType<typeof vi.fn>;
  whatsAppSend?: ReturnType<typeof vi.fn>;
  ownerEmails?: { email: string }[];
}) {
  const { delivery } = options;
  const emailSend = options.emailSend ?? vi.fn().mockResolvedValue(undefined);
  const whatsAppSend =
    options.whatsAppSend ?? vi.fn().mockResolvedValue(undefined);

  // findUnique returns the CURRENT state of `delivery` (so a prior update()
  // that flips it to FAILED is seen by the next send() call — the "4th attempt
  // is never made" property).
  const findUnique = vi.fn(() =>
    Promise.resolve({
      ...delivery,
      dailyReport: { content: { siteName: 'NH-48', reportDate: '2026-08-11' } },
    }),
  );
  const update = vi.fn(({ data }: { data: Partial<DeliveryRow> }) => {
    Object.assign(delivery, data);
    return Promise.resolve(delivery);
  });

  const prisma = {
    reportDelivery: { findUnique, update, findMany: vi.fn(), create: vi.fn() },
    user: {
      findMany: vi
        .fn()
        .mockResolvedValue(
          options.ownerEmails ?? [{ email: 'owner@example.com' }],
        ),
    },
  };

  const service = new ReportDeliveryService(
    prisma as unknown as ConstructorParameters<typeof ReportDeliveryService>[0],
    { send: emailSend } as unknown as EmailSender,
    { send: whatsAppSend } as unknown as WhatsAppSender,
  );

  return { service, prisma, delivery, emailSend, whatsAppSend, update };
}

describe('ReportDeliveryService.send — IN_APP', () => {
  it('marks the delivery SENT immediately with no external call', async () => {
    const { service, delivery, emailSend, whatsAppSend, update } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'IN_APP',
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        deliveredAt: null,
      },
    });

    await service.send('d1');

    expect(emailSend).not.toHaveBeenCalled();
    expect(whatsAppSend).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
    expect(delivery.status).toBe('SENT');
    expect(delivery.deliveredAt).toBeInstanceOf(Date);
    expect(delivery.attempts).toBe(1);
  });
});

describe('ReportDeliveryService.send — EMAIL retry policy (AC #3)', () => {
  it('increments attempts and records lastError on failure without throwing', async () => {
    const emailSend = vi
      .fn()
      .mockRejectedValue(new Error('Resend API responded 500'));
    const { service, delivery } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'EMAIL',
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        deliveredAt: null,
      },
      emailSend,
    });

    // Must not throw out of the Cron handler.
    await expect(service.send('d1')).resolves.toBeUndefined();

    expect(delivery.attempts).toBe(1);
    expect(delivery.lastError).toBe('Resend API responded 500');
    // Under the cap — still retryable, not FAILED yet.
    expect(delivery.status).toBe('PENDING');
  });

  it('marks FAILED after the 3rd failed attempt and makes no 4th attempt', async () => {
    const emailSend = vi.fn().mockRejectedValue(new Error('still failing'));
    // Two attempts already burned — this send() is the 3rd.
    const { service, delivery, update } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'EMAIL',
        status: 'PENDING',
        attempts: 2,
        lastError: 'still failing',
        deliveredAt: null,
      },
      emailSend,
    });

    await service.send('d1');
    expect(delivery.attempts).toBe(3);
    expect(delivery.status).toBe('FAILED');
    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);

    // A 4th call is a no-op: no further attempt, no further update.
    await service.send('d1');
    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('sends via the email adapter to every Owner/Admin on success', async () => {
    const emailSend = vi.fn().mockResolvedValue(undefined);
    const { service, prisma, delivery } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'EMAIL',
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        deliveredAt: null,
      },
      emailSend,
      ownerEmails: [{ email: 'a@x.com' }, { email: 'b@x.com' }],
    });

    await service.send('d1');

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'OWNER_ADMIN' },
      select: { email: true },
    });
    expect(emailSend).toHaveBeenCalledWith(
      ['a@x.com', 'b@x.com'],
      expect.objectContaining({ siteName: 'NH-48' }),
    );
    expect(delivery.status).toBe('SENT');
  });
});

describe('ReportDeliveryService.send — already-completed rows', () => {
  it('does nothing for a SENT delivery', async () => {
    const { service, emailSend, update } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'EMAIL',
        status: 'SENT',
        attempts: 1,
        lastError: null,
        deliveredAt: new Date(),
      },
    });

    await service.send('d1');

    expect(emailSend).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe('ReportDeliveryService.send — EMAIL zero recipients (AC #3, not a silent drop)', () => {
  it('records lastError / FAILED when there are no Owner/Admins to notify', async () => {
    const emailSend = vi.fn().mockResolvedValue(undefined);
    // attempts already at cap-1, so this failed attempt exhausts the retries.
    const { service, delivery } = makeHarness({
      delivery: {
        id: 'd1',
        channel: 'EMAIL',
        status: 'PENDING',
        attempts: MAX_DELIVERY_ATTEMPTS - 1,
        lastError: null,
        deliveredAt: null,
      },
      emailSend,
      ownerEmails: [],
    });

    await expect(service.send('d1')).resolves.toBeUndefined();

    // The external adapter is never called — but the failure is recorded, not
    // silently dropped.
    expect(emailSend).not.toHaveBeenCalled();
    expect(delivery.status).toBe('FAILED');
    expect(delivery.lastError).toMatch(/recipient/i);
  });
});

// A store-backed harness so ensureDeliveries/retryPending exercise the real
// send() path (created rows are actually persisted + read back), and the
// @@unique([dailyReportId, channel]) constraint is simulated by throwing P2002
// on a duplicate (report, channel) create.
interface StoredRow {
  id: string;
  dailyReportId: string;
  channel: string;
  status: string;
  attempts: number;
  lastError: string | null;
  deliveredAt: Date | null;
  dailyReport: { content: { siteName: string; reportDate: string } };
}

function makeStoreHarness(
  options: {
    preexistingChannels?: string[];
    seedRows?: { dailyReportId: string; channel: string }[];
    emailSend?: ReturnType<typeof vi.fn>;
    ownerEmails?: { email: string }[];
  } = {},
) {
  const store = new Map<string, StoredRow>();
  let counter = 0;
  const emailSend = options.emailSend ?? vi.fn().mockResolvedValue(undefined);
  const whatsAppSend = vi.fn().mockResolvedValue(undefined);

  for (const seed of options.seedRows ?? []) {
    const id = `seed${++counter}`;
    store.set(id, {
      id,
      dailyReportId: seed.dailyReportId,
      channel: seed.channel,
      status: 'PENDING',
      attempts: 0,
      lastError: null,
      deliveredAt: null,
      dailyReport: { content: { siteName: 'NH-48', reportDate: '2026-08-11' } },
    });
  }

  const create = vi.fn(
    ({ data }: { data: { dailyReportId: string; channel: string } }) => {
      const dup = [...store.values()].find(
        (row) =>
          row.dailyReportId === data.dailyReportId &&
          row.channel === data.channel,
      );
      if (dup) {
        throw new Prisma.PrismaClientKnownRequestError(
          'Unique constraint failed',
          { code: 'P2002', clientVersion: 'test' },
        );
      }
      const row: StoredRow = {
        id: `d${++counter}`,
        dailyReportId: data.dailyReportId,
        channel: data.channel,
        status: 'PENDING',
        attempts: 0,
        lastError: null,
        deliveredAt: null,
        dailyReport: {
          content: { siteName: 'NH-48', reportDate: '2026-08-11' },
        },
      };
      store.set(row.id, row);
      return Promise.resolve(row);
    },
  );

  const findMany = vi.fn((args: { where?: { status?: string } }) => {
    if (args?.where?.status) {
      // retryPending's query.
      return Promise.resolve(
        [...store.values()]
          .filter(
            (row) =>
              row.status === 'PENDING' && row.attempts < MAX_DELIVERY_ATTEMPTS,
          )
          .map((row) => ({ id: row.id })),
      );
    }
    // ensureDeliveries' existing-channels pre-check.
    return Promise.resolve(
      (options.preexistingChannels ?? []).map((channel) => ({ channel })),
    );
  });

  const findUnique = vi.fn(({ where }: { where: { id: string } }) =>
    Promise.resolve(store.get(where.id) ?? null),
  );
  const update = vi.fn(
    ({ where, data }: { where: { id: string }; data: Partial<StoredRow> }) => {
      const row = store.get(where.id);
      if (row) Object.assign(row, data);
      return Promise.resolve(row);
    },
  );

  const prisma = {
    reportDelivery: { findMany, create, findUnique, update },
    user: {
      findMany: vi
        .fn()
        .mockResolvedValue(
          options.ownerEmails ?? [{ email: 'owner@example.com' }],
        ),
    },
  };
  const service = new ReportDeliveryService(
    prisma as unknown as ConstructorParameters<typeof ReportDeliveryService>[0],
    { send: emailSend } as unknown as EmailSender,
    { send: whatsAppSend },
  );

  return { service, prisma, store, create, findMany, emailSend };
}

describe('ReportDeliveryService.ensureDeliveries (idempotent, no double-send)', () => {
  it('creates exactly the enabled channels and sends each once when none exist', async () => {
    const { service, store, create, emailSend } = makeStoreHarness();

    await service.ensureDeliveries('report1');

    // One row per enabled channel: IN_APP + EMAIL.
    expect(create).toHaveBeenCalledTimes(2);
    const rows = [...store.values()];
    expect(rows.map((r) => r.channel).sort()).toEqual(['EMAIL', 'IN_APP']);
    // IN_APP marks SENT with no external call; EMAIL sends via the adapter once.
    expect(rows.every((r) => r.status === 'SENT')).toBe(true);
    expect(emailSend).toHaveBeenCalledTimes(1);
  });

  it('creates zero rows and sends zero times when all channels already exist', async () => {
    const { service, create, emailSend } = makeStoreHarness({
      preexistingChannels: ['IN_APP', 'EMAIL'],
    });

    await service.ensureDeliveries('report1');

    expect(create).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
  });

  it('skips the send when a create loses the race (P2002), never double-delivering', async () => {
    // Pre-check reports no existing channels, but an IN_APP row already exists
    // in the DB (a concurrent run created it) — the create raises P2002.
    const { service, store, emailSend } = makeStoreHarness({
      seedRows: [{ dailyReportId: 'report1', channel: 'IN_APP' }],
    });

    await expect(service.ensureDeliveries('report1')).resolves.toBeUndefined();

    // The pre-existing IN_APP row was never re-sent (still PENDING), only the
    // new EMAIL row was created + sent.
    const inApp = [...store.values()].find((r) => r.channel === 'IN_APP');
    expect(inApp?.status).toBe('PENDING');
    const email = [...store.values()].find((r) => r.channel === 'EMAIL');
    expect(email?.status).toBe('SENT');
    expect(emailSend).toHaveBeenCalledTimes(1);
  });
});

describe('ReportDeliveryService.retryPending', () => {
  it('re-attempts only PENDING rows under the attempt cap', async () => {
    const { service, prisma } = makeStoreHarness();
    const sendSpy = vi.spyOn(service, 'send').mockResolvedValue(undefined);
    prisma.reportDelivery.findMany = vi
      .fn()
      .mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

    const result = await service.retryPending();

    expect(prisma.reportDelivery.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING', attempts: { lt: MAX_DELIVERY_ATTEMPTS } },
      select: { id: true },
    });
    expect(sendSpy).toHaveBeenCalledWith('p1');
    expect(sendSpy).toHaveBeenCalledWith('p2');
    expect(result).toEqual({ retried: 2 });
  });
});
