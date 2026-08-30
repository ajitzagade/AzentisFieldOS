import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteSiteAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  redirectMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("deleteSiteAction", () => {
  it("DELETEs the Site and redirects to the list with a records-preserved flash", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await deleteSiteAction("site-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/sites/site-1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\?flash=Site%20deleted/));
  });

  it("maps a 403 to the Owner-only message on the detail page (Supervisor feedback)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    await deleteSiteAction("site-1");

    expect(redirectMock).toHaveBeenCalledWith(
      `/sites/site-1?flash=${encodeURIComponent("Only an Owner/Admin can delete a Site.")}`,
    );
  });

  it("lands on the list, not a now-404 detail page, when another admin already deleted it", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await deleteSiteAction("site-1");

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\?flash=/));
    expect(redirectMock.mock.calls[0]![0]).toContain(encodeURIComponent("already deleted"));
  });

  it("returns to the detail page with a retry message on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    await deleteSiteAction("site-1");

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\/site-1\?flash=/));
  });
});
