import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { reassignDsrSiteDateAction } from "./reassign-actions";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
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

const validFields = { siteId: "site-2", reportDate: "2026-09-24" };

// spec-dsr-reassign-site-date: the Owner-only Reassign Site/Date Server
// Action — pin the PATCH contract, the non-redirecting success shape, and
// the 400-error mapping (both ZodValidationPipe's field-errors shape and
// the service's plain BadRequestException-string shape).
describe("reassignDsrSiteDateAction", () => {
  it("PATCHes /dsr/:id/reassign with the parsed body and resolves { success: true } without redirecting", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData(validFields));

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/dsr/dsr-1/reassign");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ siteId: "site-2", reportDate: "2026-09-24" });
    expect(state).toEqual({ success: true });
  });

  it("returns per-field errors for invalid input without calling the API", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData({ siteId: "", reportDate: "not-a-date" }));

    expect(state.errors?.siteId?.[0] ?? state.errors?.reportDate?.[0]).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the collision-rejection plain-string 400 message as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ statusCode: 400, message: "A report already exists for that Site and Date", error: "Bad Request" }),
    }) as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData(validFields));

    expect(state.formError).toBe("A report already exists for that Site and Date");
    expect(state.success).toBeUndefined();
  });

  it("surfaces the correction-history plain-string 400 message as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ statusCode: 400, message: "This report has correction history and can't be reassigned", error: "Bad Request" }),
    }) as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData(validFields));

    expect(state.formError).toMatch(/correction history/);
  });

  it("maps ZodValidationPipe's field-errors 400 shape onto state.errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "VALIDATION_FAILED",
          message: "Request body failed validation.",
          details: { fieldErrors: { siteId: ["Required"] } },
        },
      }),
    }) as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData(validFields));

    expect(state.errors).toEqual({ siteId: ["Required"] });
  });

  it("returns a generic form error on a network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const state = await reassignDsrSiteDateAction("dsr-1", {}, formData(validFields));

    expect(state.formError).toMatch(/went wrong/);
  });
});
