import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateSubcontractorAction } from "./actions";

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

function formData(fields: Record<string, string>, workCategories: string[] = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  for (const tag of workCategories) data.append("workCategories", tag);
  return data;
}

describe("updateSubcontractorAction", () => {
  it("posts the validated payload to the API and redirects to /subcontractors on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSubcontractorAction("s1", {}, formData({ name: "Renamed Works" }, ["Pipe laying"]));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/subcontractors/s1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/subcontractors\?flash=/));
  });

  it("sends an intentionally-blanked optional field as an explicit null, not an omitted key, so it actually clears", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSubcontractorAction("s1", {}, formData({ name: "Renamed Works", contactPerson: "" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.contactPerson).toBeNull();
  });

  it("sends an empty workCategories array when all tags were removed, clearing them rather than leaving them untouched", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSubcontractorAction("s1", {}, formData({ name: "Renamed Works" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.workCategories).toEqual([]);
  });

  it("returns a not-found form error on a 404 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateSubcontractorAction("missing-id", {}, formData({ name: "X" }));

    expect(result.formError).toBe("This Subcontractor no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await updateSubcontractorAction("s1", {}, formData({ name: "X" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
  });
});
