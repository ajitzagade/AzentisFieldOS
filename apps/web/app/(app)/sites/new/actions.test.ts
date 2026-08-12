import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSiteAction } from "./actions";

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

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("createSiteAction", () => {
  it("returns per-field errors for a missing required field without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSiteAction({}, formData({ name: "", location: "Nashik", status: "ACTIVE" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload to the API and redirects to /sites on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createSiteAction({}, formData({ name: "NH-48", location: "Nashik", status: "ACTIVE" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/sites",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "NH-48", location: "Nashik", status: "ACTIVE" }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/sites");
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createSiteAction({}, formData({ name: "NH-48", location: "Nashik", status: "ACTIVE" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a generic form error on a non-400 API failure, never a raw status", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createSiteAction({}, formData({ name: "NH-48", location: "Nashik", status: "ACTIVE" }));

    expect(result.formError).toBe("Something went wrong creating the Site. Please try again.");
  });
});
