import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createReturnWastageAction } from "./actions";

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
  kind: "WASTAGE",
  quantity: "5",
  recordedAt: "2026-08-13",
};

describe("createReturnWastageAction", () => {
  it("returns a per-field error for a non-positive quantity with no correction, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createReturnWastageAction({}, formData({ ...validFields, quantity: "0" }));

    expect(result.errors?.quantity).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload with kind and redirects to /movements on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createReturnWastageAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.kind).toBe("WASTAGE");
    expect(redirectMock).toHaveBeenCalledWith("/movements");
  });

  it("posts kind RETURN when the form submits a Return", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createReturnWastageAction({}, formData({ ...validFields, kind: "RETURN" }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.kind).toBe("RETURN");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { siteId: ["This Site does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createReturnWastageAction({}, formData(validFields));

    expect(result.errors?.siteId).toEqual(["This Site does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createReturnWastageAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording this entry. Please try again.");
  });
});
