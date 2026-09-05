import { describe, expect, it, vi } from 'vitest';
import { MissingReportRemindersService } from './missing-report-reminders.service';
import type { PushPayload } from '../push-notifications/push-notifications.service';
import type { Role } from '../generated/prisma/client';

function makeService(sitesMissingDsrToday: { siteId: string; name: string }[]) {
  const dashboard = {
    getToday: vi.fn().mockResolvedValue({ sitesMissingDsrToday }),
  };
  const sendToRole = vi
    .fn<(role: Role, payload: PushPayload) => Promise<void>>()
    .mockResolvedValue(undefined);
  const pushNotifications = { sendToRole };
  const service = new MissingReportRemindersService(
    dashboard as unknown as ConstructorParameters<
      typeof MissingReportRemindersService
    >[0],
    pushNotifications as unknown as ConstructorParameters<
      typeof MissingReportRemindersService
    >[1],
  );
  return { service, sendToRole };
}

describe('MissingReportRemindersService', () => {
  it('sends nothing when every Site has reported', async () => {
    const { service, sendToRole } = makeService([]);

    const result = await service.send();

    expect(result).toEqual({ missingCount: 0 });
    expect(sendToRole).not.toHaveBeenCalled();
  });

  it('pushes both Supervisors and Owner/Admins, singular wording for exactly one missing Site', async () => {
    const { service, sendToRole } = makeService([
      { siteId: 's1', name: 'NH-48 Widening' },
    ]);

    const result = await service.send();

    expect(result).toEqual({ missingCount: 1 });
    expect(sendToRole).toHaveBeenCalledTimes(2);
    const supervisorCall = sendToRole.mock.calls.find(
      (call) => call[0] === 'SITE_SUPERVISOR',
    );
    const ownerCall = sendToRole.mock.calls.find(
      (call) => call[0] === 'OWNER_ADMIN',
    );
    expect(supervisorCall![1].body).toBe(
      "NH-48 Widening hasn't submitted today's Daily Report yet.",
    );
    expect(ownerCall![1].body).toBe('NH-48 Widening');
  });

  it('pushes plural wording and names every Site when several are missing', async () => {
    const { service, sendToRole } = makeService([
      { siteId: 's1', name: 'NH-48 Widening' },
      { siteId: 's2', name: 'Metro Depot' },
    ]);

    const result = await service.send();

    expect(result).toEqual({ missingCount: 2 });
    const supervisorCall = sendToRole.mock.calls.find(
      (call) => call[0] === 'SITE_SUPERVISOR',
    );
    const ownerCall = sendToRole.mock.calls.find(
      (call) => call[0] === 'OWNER_ADMIN',
    );
    expect(supervisorCall![1].body).toBe(
      "2 Sites haven't submitted today's Daily Report yet.",
    );
    expect(ownerCall![1].body).toBe('NH-48 Widening, Metro Depot');
  });
});
