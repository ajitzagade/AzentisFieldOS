import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateSiteAction } from "./actions";

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

// The real EditSiteForm always renders all four fields (defaultValue-based,
// not diff-tracked), so a real submission always includes all of them —
// this mirrors that, rather than an unrealistic FormData missing keys the
// form never actually omits.
function formData(overrides: Partial<Record<"name" | "location" | "status" | "contractReference", string>> = {}) {
  const data = new FormData();
  data.set("name", overrides.name ?? "NH-48 Highway Widening");
  data.set("location", overrides.location ?? "Nashik");
  data.set("status", overrides.status ?? "ACTIVE");
  if (overrides.contractReference !== undefined) data.set("contractReference", overrides.contractReference);
  return data;
}

describe("updateSiteAction", () => {
  it("PATCHes the full validated payload and redirects to /sites on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSiteAction("site-1", {}, formData({ status: "ON_HOLD" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/sites/site-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "NH-48 Highway Widening", location: "Nashik", status: "ON_HOLD" }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\?flash=/));
  });

  it("succeeds as a no-op when resubmitted with the Site's own unchanged values, rather than erroring", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSiteAction("site-1", {}, formData());

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3001/sites/site-1", expect.objectContaining({ method: "PATCH" }));
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\?flash=/));
  });

  it("returns a not-found form error, not a raw 404, when the Site no longer exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateSiteAction("missing", {}, formData());

    expect(result.formError).toBe("This Site no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await updateSiteAction("site-1", {}, formData());

    expect(result.errors).toEqual({ name: ["Too long"] });
  });

  it("rejects client-side without calling the API when a required field is blanked out", async () => {
    global.fetch = vi.fn();

    const result = await updateSiteAction("site-1", {}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
