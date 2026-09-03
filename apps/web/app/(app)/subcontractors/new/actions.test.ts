import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSubcontractorAction, createSubcontractorQuickAction } from "./actions";

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

function formData(fields: Record<string, string>, workCategories: string[] = []) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  for (const tag of workCategories) data.append("workCategories", tag);
  return data;
}

describe("createSubcontractorAction", () => {
  it("returns a per-field error for a missing required name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSubcontractorAction({}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload, including workCategories as an array, and redirects to /subcontractors on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "sub-1", name: "Ganesh Pipeline Works" }),
    }) as unknown as typeof fetch;

    await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }, ["Pipe laying", "Trenching"]));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/subcontractors",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Ganesh Pipeline Works",
          workCategories: ["Pipe laying", "Trenching"],
        }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/subcontractors\?flash=/));
  });

  it("defaults workCategories to an empty array when none were added", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "sub-1", name: "Ganesh Pipeline Works" }),
    }) as unknown as typeof fetch;

    await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/subcontractors",
      expect.objectContaining({
        body: JSON.stringify({ name: "Ganesh Pipeline Works", workCategories: [] }),
      }),
    );
  });

  it("rejects an invalid email without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works", email: "not-an-email" }));

    expect(result.errors?.email).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a generic form error on a non-400 API failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result.formError).toBe("Something went wrong creating the Subcontractor. Please try again.");
  });

  it("maps a 403 to the Owner-only message", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result.formError).toBe("Only an Owner/Admin can add a Subcontractor.");
  });

  it("returns a form error instead of throwing on a network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createSubcontractorAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result.formError).toBe("Something went wrong creating the Subcontractor. Please try again.");
  });
});

describe("createSubcontractorQuickAction", () => {
  it("returns { success, id, name } instead of redirecting, and revalidates every Subcontractor-listing route", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "sub-1", name: "Ganesh Pipeline Works" }),
    }) as unknown as typeof fetch;

    const result = await createSubcontractorQuickAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result).toEqual({ success: true, id: "sub-1", name: "Ganesh Pipeline Works" });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/subcontractors");
    expect(revalidatePathMock).toHaveBeenCalledWith("/sites/[id]/contracts", "page");
  });

  it("surfaces the same Owner/Admin-only 403 as the full form", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await createSubcontractorQuickAction({}, formData({ name: "Ganesh Pipeline Works" }));

    expect(result.formError).toBe("Only an Owner/Admin can add a Subcontractor.");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
