import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createConsumptionAction } from "./actions";

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

const validFields = {
  siteId: "11111111-1111-4111-8111-111111111111",
  materialSizeId: "22222222-2222-4222-8222-222222222222",
  quantity: "10",
  consumedAt: "2026-08-13",
  recordedByUserId: "33333333-3333-4333-8333-333333333333",
};

describe("createConsumptionAction", () => {
  it("returns a per-field error for a non-positive quantity with no correction, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createConsumptionAction({}, formData({ ...validFields, quantity: "0" }));

    expect(result.errors?.quantity).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to /movements on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createConsumptionAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/consumption",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/movements");
  });

  it("includes correctsId and reason when filing a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createConsumptionAction({}, formData({ ...validFields, quantity: "-4", correctsId: "c1", reason: "Recount" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.correctsId).toBe("c1");
    expect(body.reason).toBe("Recount");
    expect(body.quantity).toBe(-4);
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { siteId: ["This Site does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createConsumptionAction({}, formData(validFields));

    expect(result.errors?.siteId).toEqual(["This Site does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createConsumptionAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Consumption. Please try again.");
  });
});
