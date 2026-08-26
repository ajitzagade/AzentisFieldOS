import { UnauthorizedException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock svix's Webhook so we control verify()'s outcome without a real secret.
// A class (not vi.fn().mockImplementation) is used deliberately — a mock fn
// invoked with `new` and returning an object mis-constructs under this repo's
// SWC transform; a real class instantiates cleanly and delegates to verifyMock.
const verifyMock = vi.hoisted(() => vi.fn());
vi.mock('svix', () => ({
  Webhook: class {
    verify(payload: unknown, headers: unknown) {
      return verifyMock(payload, headers);
    }
  },
}));

import { ClerkWebhookController } from './clerk-webhook.controller';

function makeService() {
  return {
    handleUserCreated: vi.fn().mockResolvedValue(undefined),
    handleUserUpdated: vi.fn().mockResolvedValue(undefined),
    handleUserDeleted: vi.fn(),
  };
}

function makeReq(raw: string | undefined): RawBodyRequest<Request> {
  return {
    rawBody: raw === undefined ? undefined : Buffer.from(raw, 'utf8'),
  } as unknown as RawBodyRequest<Request>;
}

const HEADERS = {
  id: 'svix-id-1',
  timestamp: '1700000000',
  signature: 'v1,abc',
};

describe('ClerkWebhookController', () => {
  const originalSecret = process.env.CLERK_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';
    verifyMock.mockReset();
  });

  afterEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = originalSecret;
  });

  it('rejects an unverified Svix signature with 401 and never processes the payload', async () => {
    verifyMock.mockImplementation(() => {
      throw new Error('signature mismatch');
    });
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    await expect(
      controller.handle(makeReq('{"type":"user.created"}'), HEADERS.id, HEADERS.timestamp, HEADERS.signature),
    ).rejects.toThrow(UnauthorizedException);
    expect(service.handleUserCreated).not.toHaveBeenCalled();
  });

  it('fails closed with 401 when CLERK_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    await expect(
      controller.handle(makeReq('{}'), HEADERS.id, HEADERS.timestamp, HEADERS.signature),
    ).rejects.toThrow(UnauthorizedException);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('rejects with 401 when the raw body is missing (rawBody not buffered)', async () => {
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    await expect(
      controller.handle(makeReq(undefined), HEADERS.id, HEADERS.timestamp, HEADERS.signature),
    ).rejects.toThrow(UnauthorizedException);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('dispatches a verified user.created event to the service', async () => {
    const data = { id: 'clerk_1' };
    verifyMock.mockImplementation(() => ({ type: 'user.created', data }));
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    const result = await controller.handle(
      makeReq('{"type":"user.created"}'),
      HEADERS.id,
      HEADERS.timestamp,
      HEADERS.signature,
    );

    expect(service.handleUserCreated).toHaveBeenCalledWith(data);
    expect(result).toEqual({ received: true });
  });

  it('dispatches a verified user.updated event to the service', async () => {
    const data = { id: 'clerk_1' };
    verifyMock.mockImplementation(() => ({ type: 'user.updated', data }));
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    await controller.handle(makeReq('{"x":1}'), HEADERS.id, HEADERS.timestamp, HEADERS.signature);
    expect(service.handleUserUpdated).toHaveBeenCalledWith(data);
  });

  it('does NOT delete the User row on user.deleted (no-op beyond acknowledging)', async () => {
    verifyMock.mockImplementation(() => ({ type: 'user.deleted', data: { id: 'clerk_1', deleted: true } }));
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    const result = await controller.handle(makeReq('{}'), HEADERS.id, HEADERS.timestamp, HEADERS.signature);
    expect(service.handleUserDeleted).toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });

  it('acknowledges an unrelated event type without touching any user handler', async () => {
    verifyMock.mockImplementation(() => ({ type: 'session.created', data: {} }));
    const service = makeService();
    const controller = new ClerkWebhookController(
      service as unknown as ConstructorParameters<typeof ClerkWebhookController>[0],
    );

    const result = await controller.handle(makeReq('{}'), HEADERS.id, HEADERS.timestamp, HEADERS.signature);
    expect(service.handleUserCreated).not.toHaveBeenCalled();
    expect(service.handleUserUpdated).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });
});
