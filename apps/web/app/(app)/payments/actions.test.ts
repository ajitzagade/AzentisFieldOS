import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import { createPaymentAction, markPaymentPaidAction } from "./actions";

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

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const validFields = {
  teamMemberId: "11111111-1111-4111-8111-111111111111",
  basePay: "15000",
};

describe("createPaymentAction", () => {
  it("returns a per-field error for a negative basePay, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createPaymentAction({}, formData({ ...validFields, basePay: "-100" }));

    expect(result.errors?.basePay).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to /payments on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createPaymentAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/payments",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/payments");
  });

  it("omits advanceAdjustment from the payload when includeAdjustment is not 'true' (AC #3)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createPaymentAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.advanceAdjustment).toBeUndefined();
  });

  it("reconstructs the nested advanceAdjustment object from flat form fields when includeAdjustment is 'true'", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createPaymentAction(
        {},
        formData({
          ...validFields,
          includeAdjustment: "true",
          advanceId: "22222222-2222-4222-8222-222222222222",
          adjustmentAmount: "3000",
          adjustmentNote: "Adjusted against this payment",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.advanceAdjustment).toEqual({
      advanceId: "22222222-2222-4222-8222-222222222222",
      amount: 3000,
      note: "Adjusted against this payment",
    });
  });

  it("surfaces a 400 ADJUSTMENT_EXCEEDS_BALANCE response as a field error on adjustmentAmount, not a generic form error", async () => {
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

    const result = await createPaymentAction(
      {},
      formData({
        ...validFields,
        includeAdjustment: "true",
        advanceId: "22222222-2222-4222-8222-222222222222",
        adjustmentAmount: "999999",
      }),
    );

    expect(result.errors?.adjustmentAmount).toEqual(["Adjustment cannot exceed the current Outstanding Balance."]);
    expect(result.formError).toBeUndefined();
  });

  it("surfaces the API's Zod field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { teamMemberId: ["This Team Member does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createPaymentAction({}, formData(validFields));

    expect(result.errors?.teamMemberId).toEqual(["This Team Member does not exist"]);
  });

  it("returns a form-level error message when the API returns 400 with no field errors, reading Nest's real BadRequestException(string) body shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "This Payment references a Team Member or Advance that does not exist",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await createPaymentAction({}, formData(validFields));

    expect(result.formError).toBe("This Payment references a Team Member or Advance that does not exist");
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createPaymentAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Payment. Please try again.");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createPaymentAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Payment. Please try again.");
  });
});

describe("markPaymentPaidAction", () => {
  it("PATCHes mark-paid and revalidates /payments on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    const result = await markPaymentPaidAction("p1");

    // Story 1.8: the shared authed-fetch helper also attaches an Authorization
    // header, so the init object now carries `headers` alongside `method`.
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/payments/p1/mark-paid",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/payments");
    expect(result).toEqual({});
  });

  it("returns a form error for an already-paid Payment (409), without revalidating", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 409 }) as unknown as typeof fetch;

    const result = await markPaymentPaidAction("p1");

    expect(result.formError).toBe("This Payment has already been marked paid.");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns a form error for a Payment that no longer exists (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await markPaymentPaidAction("missing");

    expect(result.formError).toBe("This Payment no longer exists.");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await markPaymentPaidAction("p1");

    expect(result.formError).toBe("Could not mark this Payment as paid. Please try again.");
  });
});
