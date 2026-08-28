import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createAdvanceAction } from "./actions";

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
  amount: "5000",
  givenAt: "2026-08-13",
};

describe("createAdvanceAction", () => {
  it("returns a per-field error for a non-positive amount with no correction, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createAdvanceAction({}, formData({ ...validFields, amount: "0" }));

    expect(result.errors?.amount).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to the Team Member detail route on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createAdvanceAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/advances",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/team\/11111111-1111-4111-8111-111111111111\?flash=/));
  });

  it("includes correctsId and correctionReason when filing a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createAdvanceAction(
        {},
        formData({
          ...validFields,
          amount: "-2000",
          correctsId: "44444444-4444-4444-8444-444444444444",
          correctionReason: "Recorded in error",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.correctsId).toBe("44444444-4444-4444-8444-444444444444");
    expect(body.correctionReason).toBe("Recorded in error");
    expect(body.amount).toBe(-2000);
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { teamMemberId: ["This Team Member does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAction({}, formData(validFields));

    expect(result.errors?.teamMemberId).toEqual(["This Team Member does not exist"]);
  });

  it("returns a form-level error message when the API returns 400 with no field errors, reading Nest's real BadRequestException(string) body shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "This Advance references a Team Member that does not exist",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAction({}, formData(validFields));

    expect(result.formError).toBe("This Advance references a Team Member that does not exist");
  });

  it("surfaces decrementOutstandingBalanceWithFloorCheck's own message as a field error on Amount, not the generic FK fallback", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          code: "ADJUSTMENT_EXCEEDS_BALANCE",
          message: "This correction would take the Team Member's Outstanding Balance below zero.",
        },
      }),
    }) as unknown as typeof fetch;

    const result = await createAdvanceAction(
      {},
      formData({
        ...validFields,
        amount: "-999999",
        correctsId: "44444444-4444-4444-8444-444444444444",
        correctionReason: "Testing floor-check error surfacing",
      }),
    );

    expect(result.errors?.amount).toEqual(["This correction would take the Team Member's Outstanding Balance below zero."]);
    expect(result.formError).toBeUndefined();
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createAdvanceAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Advance. Please try again.");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createAdvanceAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Advance. Please try again.");
  });

  it("returns the generic fallback instead of throwing when a 400 response body isn't valid JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    }) as unknown as typeof fetch;

    const result = await createAdvanceAction({}, formData(validFields));

    expect(result.formError).toBe("This Advance references a Team Member that does not exist.");
  });
});
