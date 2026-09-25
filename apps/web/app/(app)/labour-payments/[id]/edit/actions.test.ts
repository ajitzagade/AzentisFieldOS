import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateDailyLabourerAction } from "./actions";

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

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("updateDailyLabourerAction", () => {
  it("posts the validated payload to the API and redirects to the Labourer's detail page on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateDailyLabourerAction("l1", {}, formData({ name: "Renamed", category: "Mistri", defaultPerDayAmount: "900" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/daily-labourers/l1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/labour-payments\/l1\?flash=/));
  });

  it("sends an intentionally-blanked Per-Day Amount as an explicit null, not an omitted key, so it actually clears", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateDailyLabourerAction("l1", {}, formData({ name: "Renamed", category: "Men", defaultPerDayAmount: "" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.defaultPerDayAmount).toBeNull();
  });

  it("returns a not-found form error on a 404 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateDailyLabourerAction("missing-id", {}, formData({ name: "X", category: "Men" }));

    expect(result.formError).toBe("This Labourer no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns an Owner/Admin-only form error on a 403 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await updateDailyLabourerAction("l1", {}, formData({ name: "X", category: "Men" }));

    expect(result.formError).toBe("Only an Owner/Admin can edit a Labourer.");
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { name: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await updateDailyLabourerAction("l1", {}, formData({ name: "X", category: "Men" }));

    expect(result.errors).toEqual({ name: ["Too long"] });
  });
});
