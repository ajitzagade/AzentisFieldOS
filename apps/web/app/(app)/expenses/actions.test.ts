import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createExpenseAction } from "./actions";

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
  categoryId: "22222222-2222-4222-8222-222222222222",
  amount: "5000",
  incurredAt: "2026-08-13",
};

describe("createExpenseAction", () => {
  it("returns a per-field error for a non-positive amount with no correction, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createExpenseAction({}, formData({ ...validFields, amount: "0" }));

    expect(result.errors?.amount).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to /expenses on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createExpenseAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/expenses",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/expenses");
  });

  it("includes correctsId and reason when filing a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createExpenseAction(
        {},
        formData({
          ...validFields,
          amount: "-500",
          correctsId: "33333333-3333-4333-8333-333333333333",
          reason: "Recount: overcharged by 500",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.correctsId).toBe("33333333-3333-4333-8333-333333333333");
    expect(body.reason).toBe("Recount: overcharged by 500");
    expect(body.amount).toBe(-500);
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { siteId: ["This Site does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createExpenseAction({}, formData(validFields));

    expect(result.errors?.siteId).toEqual(["This Site does not exist"]);
  });

  it("returns a form-level error message when the API returns 400 with no field errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "A correction's Site and Category must match the Expense it corrects",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await createExpenseAction({}, formData(validFields));

    expect(result.formError).toBe("A correction's Site and Category must match the Expense it corrects");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createExpenseAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording this expense. Please try again.");
  });
});
