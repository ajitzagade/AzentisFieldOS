import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

import { createWasteDisposalAction } from "./actions";

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
  siteId: "11111111-1111-4111-8111-111111111111",
  wasteType: "Construction debris",
  ownership: "OWN",
  tripCount: "2",
  disposedAt: "2026-08-13",
};

describe("createWasteDisposalAction", () => {
  it("returns a per-field error for a missing wasteType, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createWasteDisposalAction({}, formData({ ...validFields, wasteType: "" }));

    expect(result.errors?.wasteType).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to /waste-disposal on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createWasteDisposalAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/waste-disposals",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/waste-disposal\?flash=/));
    expect(revalidatePathMock).toHaveBeenCalledWith("/waste-disposal");
  });

  it("includes correctsId and reason when filing a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createWasteDisposalAction(
        {},
        formData({
          ...validFields,
          correctsId: "33333333-3333-4333-8333-333333333333",
          reason: "Recount: one trip short",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.correctsId).toBe("33333333-3333-4333-8333-333333333333");
    expect(body.reason).toBe("Recount: one trip short");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { siteId: ["This Site does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createWasteDisposalAction({}, formData(validFields));

    expect(result.errors?.siteId).toEqual(["This Site does not exist"]);
  });

  it("returns a form-level error message when the API returns 400 with no field errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "This entry references a Site, Vendor or asset that does not exist." }),
    }) as unknown as typeof fetch;

    const result = await createWasteDisposalAction({}, formData(validFields));

    expect(result.formError).toBe("This entry references a Site, Vendor or asset that does not exist.");
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createWasteDisposalAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording this disposal. Please try again.");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createWasteDisposalAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording this disposal. Please try again.");
  });
});
