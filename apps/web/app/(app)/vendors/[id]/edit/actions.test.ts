import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateVendorAction } from "./actions";

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

function formData(fields: Record<string, string>, materialsSupplied: string[] = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  for (const tag of materialsSupplied) data.append("materialsSupplied", tag);
  return data;
}

describe("updateVendorAction", () => {
  it("posts the validated payload to the API and redirects to /vendors on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateVendorAction("v1", {}, formData({ name: "Renamed Traders" }, ["Cement"]));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vendors/v1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/vendors\?flash=/));
  });

  it("sends an intentionally-blanked optional field as an explicit null, not an omitted key, so it actually clears", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateVendorAction("v1", {}, formData({ name: "Renamed Traders", contactPerson: "" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.contactPerson).toBeNull();
  });

  it("sends an empty materialsSupplied array when all tags were removed, clearing them rather than leaving them untouched", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateVendorAction("v1", {}, formData({ name: "Renamed Traders" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.materialsSupplied).toEqual([]);
  });

  it("returns a not-found form error on a 404 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateVendorAction("missing-id", {}, formData({ name: "X" }));

    expect(result.formError).toBe("This Vendor no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await updateVendorAction("v1", {}, formData({ name: "X" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
  });
});
