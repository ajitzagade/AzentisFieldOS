import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVendorAction } from "./actions";

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

describe("createVendorAction", () => {
  it("returns a per-field error for a missing required name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createVendorAction({}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload, including materialsSupplied as an array, and redirects to /vendors on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createVendorAction({}, formData({ name: "Shree Balaji Traders" }, ["Cement", "Steel"]));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vendors",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Shree Balaji Traders",
          materialsSupplied: ["Cement", "Steel"],
        }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/vendors\?flash=/));
  });

  it("defaults materialsSupplied to an empty array when no tags were added", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createVendorAction({}, formData({ name: "Shree Balaji Traders" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vendors",
      expect.objectContaining({
        body: JSON.stringify({ name: "Shree Balaji Traders", materialsSupplied: [] }),
      }),
    );
  });

  it("rejects an invalid email without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createVendorAction({}, formData({ name: "Shree Balaji Traders", email: "not-an-email" }));

    expect(result.errors?.email).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createVendorAction({}, formData({ name: "Shree Balaji Traders" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a generic form error on a non-400 API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createVendorAction({}, formData({ name: "Shree Balaji Traders" }));

    expect(result.formError).toBe("Something went wrong creating the Vendor. Please try again.");
  });
});
