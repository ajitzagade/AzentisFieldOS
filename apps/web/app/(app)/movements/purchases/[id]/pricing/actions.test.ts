import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { completePricingAction } from "./actions";

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

const validFields = { rate: "390", totalAmount: "19500", paymentStatus: "UNPAID" };

// D7: the action that closes the pricing loop — pin the PATCH contract, the
// error mapping, and the success redirect.
describe("completePricingAction", () => {
  it("PATCHes /purchases/:id/pricing with the parsed pricing body and redirects on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(completePricingAction("p1", {}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/purchases/p1/pricing");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ rate: 390, totalAmount: 19500, paymentStatus: "UNPAID" });
    expect(redirectMock).toHaveBeenCalledWith(expect.stringContaining("/movements?flash="));
  });

  it("returns per-field errors for invalid input without calling the API", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const state = await completePricingAction("p1", {}, formData({ ...validFields, rate: "0" }));

    expect(state.errors?.rate?.[0]).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces the API's already-priced 400 message as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "This Purchase is already priced — changes to a priced Purchase must be filed as a correction" }),
    }) as unknown as typeof fetch;

    const state = await completePricingAction("p1", {}, formData(validFields));

    expect(state.formError).toMatch(/already priced/);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
