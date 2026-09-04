import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { deleteVendorAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

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

describe("deleteVendorAction", () => {
  it("DELETEs the Vendor and redirects to the list with a records-preserved flash", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await deleteVendorAction("v-1");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vendors/v-1",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/vendors\?flash=Vendor%20deleted/));
  });

  it("maps a 403 to the Owner-only message on the detail page", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    await deleteVendorAction("v-1");

    expect(redirectMock).toHaveBeenCalledWith(
      `/vendors/v-1?flash=${encodeURIComponent("Only an Owner/Admin can delete a Vendor.")}`,
    );
  });

  it("lands on the list when another admin already deleted it (404 race)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    await deleteVendorAction("v-1");

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/vendors\?flash=/));
    expect(redirectMock.mock.calls[0]![0]).toContain(encodeURIComponent("already deleted"));
  });
});
