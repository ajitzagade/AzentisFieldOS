import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setDailyLabourerActiveAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  redirectMock.mockClear();
  revalidatePathMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("setDailyLabourerActiveAction", () => {
  it("PATCHes isActive:false and redirects back to the same detail page with a records-preserved flash", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await setDailyLabourerActiveAction("l1", false);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/daily-labourers/l1/active",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ isActive: false }) }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/labour-payments\/l1\?flash=Labourer%20deleted/));
  });

  it("PATCHes isActive:true and redirects with a reactivated flash", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await setDailyLabourerActiveAction("l1", true);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/daily-labourers/l1/active",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ isActive: true }) }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/labour-payments\/l1\?flash=Labourer%20reactivated/));
  });

  it("maps a 403 to the Owner-only message on the same detail page", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    await setDailyLabourerActiveAction("l1", false);

    expect(redirectMock).toHaveBeenCalledWith(
      `/labour-payments/l1?flash=${encodeURIComponent("Only an Owner/Admin can deactivate a Labourer.")}`,
    );
  });

  it("lands on the list when the Labourer no longer exists (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await setDailyLabourerActiveAction("l1", false);

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/labour-payments\?flash=/));
  });
});
