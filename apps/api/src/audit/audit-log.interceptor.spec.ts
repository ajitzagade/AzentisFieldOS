import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { AuditLogInterceptor } from './audit-log.interceptor';

function makeInterceptor() {
  const create = vi.fn().mockResolvedValue({});
  const prisma = { auditLog: { create } };
  const interceptor = new AuditLogInterceptor(
    prisma as unknown as ConstructorParameters<typeof AuditLogInterceptor>[0],
  );
  return { interceptor, create };
}

function makeContext(request: {
  method: string;
  url: string;
  user?: { id: string; role: string };
  body?: Record<string, unknown>;
}): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function handlerReturning(response: unknown): CallHandler {
  return { handle: () => of(response) };
}

const OWNER = { id: 'user-1', role: 'OWNER_ADMIN' };

async function run(
  interceptor: AuditLogInterceptor,
  request: Parameters<typeof makeContext>[0],
  response: unknown = { id: 'row-1' },
) {
  return lastValueFrom(
    interceptor.intercept(makeContext(request), handlerReturning(response)),
  );
}

describe('AuditLogInterceptor — what gets audited', () => {
  it('audits a successful POST by a signed-in user with actor, action, entity and Site', async () => {
    const { interceptor, create } = makeInterceptor();

    await run(
      interceptor,
      {
        method: 'POST',
        url: '/expenses?x=1',
        user: OWNER,
        body: { siteId: 'site-1', amount: 100 },
      },
      { id: 'exp-1' },
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        method: 'POST',
        path: '/expenses',
        action: 'Created Expense',
        entityType: 'Expense',
        entityId: 'exp-1',
        siteId: 'site-1',
      },
    });
  });

  it('never audits GET requests or requests without a signed-in user', async () => {
    const { interceptor, create } = makeInterceptor();

    await run(interceptor, { method: 'GET', url: '/expenses', user: OWNER });
    await run(interceptor, { method: 'POST', url: '/expenses' }); // no user

    expect(create).not.toHaveBeenCalled();
  });

  it('skips login, cron and presign paths — including the branding logo presign', async () => {
    const { interceptor, create } = makeInterceptor();

    for (const url of [
      '/auth/login',
      '/cron/compile-daily-reports',
      '/photos/presign',
      '/photos/challan/presign',
      '/branding-config/logo/presign',
    ]) {
      await run(interceptor, { method: 'POST', url, user: OWNER });
    }

    expect(create).not.toHaveBeenCalled();
  });

  it('skip prefixes match on segment boundaries — a sibling path is still audited', async () => {
    const { interceptor, create } = makeInterceptor();

    // '/auth' must not swallow a hypothetical '/auth-tokens'-style route.
    await run(interceptor, {
      method: 'POST',
      url: '/auth-adjacent',
      user: OWNER,
    });

    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe('AuditLogInterceptor — action naming and Site attribution', () => {
  it('names corrections, deletes, mark-paid and confirm-receipt distinctly', async () => {
    const { interceptor, create } = makeInterceptor();

    await run(interceptor, {
      method: 'POST',
      url: '/purchases',
      user: OWNER,
      body: { correctsId: 'p-1' },
    });
    await run(interceptor, {
      method: 'DELETE',
      url: '/sites/s-1',
      user: OWNER,
    });
    await run(interceptor, {
      method: 'PATCH',
      url: '/payments/p-1/mark-paid',
      user: OWNER,
    });
    await run(interceptor, {
      method: 'PATCH',
      url: '/movements/m-1/confirm-receipt',
      user: OWNER,
    });

    const actions = create.mock.calls.map(
      (call) => (call[0] as { data: { action: string } }).data.action,
    );
    expect(actions).toEqual([
      'Corrected Purchase',
      'Deleted Site',
      'Marked Payment as paid',
      'Confirmed Movement receipt',
    ]);
  });

  it('attributes a Movement to its destination Site (Movements have no bare siteId)', async () => {
    const { interceptor, create } = makeInterceptor();

    await run(interceptor, {
      method: 'POST',
      url: '/movements',
      user: OWNER,
      body: { destinationSiteId: 'site-dest', sentQuantity: 5 },
    });

    const arg = create.mock.calls[0]![0] as { data: { siteId?: string } };
    expect(arg.data.siteId).toBe('site-dest');
  });

  it('attributes an action on a Site itself to that Site', async () => {
    const { interceptor, create } = makeInterceptor();

    await run(
      interceptor,
      { method: 'DELETE', url: '/sites/abc', user: OWNER },
      { id: 'abc' },
    );

    const arg = create.mock.calls[0]![0] as {
      data: { siteId?: string; entityType?: string };
    };
    expect(arg.data.siteId).toBe('abc');
    expect(arg.data.entityType).toBe('Site');
  });
});

describe('AuditLogInterceptor — failure isolation', () => {
  it("an audit-write failure never fails the user's own request", async () => {
    const { interceptor, create } = makeInterceptor();
    create.mockRejectedValue(new Error('db down'));

    const result = await run(
      interceptor,
      { method: 'POST', url: '/expenses', user: OWNER, body: {} },
      { id: 'exp-1' },
    );

    expect(result).toEqual({ id: 'exp-1' });
  });

  it('the audit insert is awaited before the response is emitted (no fire-and-forget)', async () => {
    const { interceptor, create } = makeInterceptor();
    let settled = false;
    create.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      settled = true;
      return {};
    });

    await run(interceptor, {
      method: 'POST',
      url: '/expenses',
      user: OWNER,
      body: {},
    });

    // If the write were fire-and-forget, the observable would complete
    // before the insert settles — on serverless the row would be lost.
    expect(settled).toBe(true);
  });
});
