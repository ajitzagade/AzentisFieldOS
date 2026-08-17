import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createAdvanceAdjustmentAction } from "./actions";

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
  teamMemberId: "11111111-1111-4111-8111-111111111111",
  advanceId: "22222222-2222-4222-8222-222222222222",
  amount: "3000",
  adjustedAt: "2026-08-13",
};

describe("createAdvanceAdjustmentAction", () => {
  it("returns a per-field error for a non-positive amount with no correction, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createAdvanceAdjustmentAction({}, formData({ ...validFields, amount: "0" }));

    expect(result.errors?.amount).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to the Team Member detail route on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createAdvanceAdjustmentAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/advance-adjustments",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/team/11111111-1111-4111-8111-111111111111");
  });

  it("includes correctsId and correctionReason when filing a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createAdvanceAdjustmentAction(
        {},
        formData({
          ...validFields,
          amount: "-1000",
          correctsId: "44444444-4444-4444-8444-444444444444",
          correctionReason: "Recorded in error",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.correctsId).toBe("44444444-4444-4444-8444-444444444444");
    expect(body.correctionReason).toBe("Recorded in error");
    expect(body.amount).toBe(-1000);
  });

  it("surfaces a 400 ADJUSTMENT_EXCEEDS_BALANCE response as a field error on amount, not a generic form error (AC #1)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "ADJUSTMENT_EXCEEDS_BALANCE",
          message: "Adjustment cannot exceed the current Outstanding Balance.",
        },
      }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAdjustmentAction({}, formData(validFields));

    expect(result.errors?.amount).toEqual(["Adjustment cannot exceed the current Outstanding Balance."]);
    expect(result.formError).toBeUndefined();
  });

  it("surfaces the API's Zod field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { advanceId: ["This Advance does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAdjustmentAction({}, formData(validFields));

    expect(result.errors?.advanceId).toEqual(["This Advance does not exist"]);
  });

  it("returns a form-level error message when the API returns 400 with no field errors, reading Nest's real BadRequestException(string) body shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "This Advance Adjustment references an Advance or Payment that does not exist",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAdjustmentAction({}, formData(validFields));

    expect(result.formError).toBe("This Advance Adjustment references an Advance or Payment that does not exist");
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createAdvanceAdjustmentAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Adjustment. Please try again.");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createAdvanceAdjustmentAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Adjustment. Please try again.");
  });
});
