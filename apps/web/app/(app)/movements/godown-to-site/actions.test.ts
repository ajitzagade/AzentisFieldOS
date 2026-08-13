import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createMovementAction } from "./actions";

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
  kind: "GODOWN_TO_SITE",
  materialSizeId: "22222222-2222-4222-8222-222222222222",
  destinationSiteId: "33333333-3333-4333-8333-333333333333",
  sentQuantity: "100",
  movedAt: "2026-08-13",
};

describe("createMovementAction", () => {
  it("rejects an invalid payload without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createMovementAction({}, formData({ ...validFields, sentQuantity: "0" }));

    expect(result.errors?.sentQuantity).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload with kind GODOWN_TO_SITE and redirects to /movements on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createMovementAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.kind).toBe("GODOWN_TO_SITE");
    expect(redirectMock).toHaveBeenCalledWith("/movements");
  });

  it("Story 5.4: posts sourceSiteId and kind SITE_TO_SITE when the form submits a transfer", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createMovementAction(
        {},
        formData({ ...validFields, kind: "SITE_TO_SITE", sourceSiteId: "44444444-4444-4444-8444-444444444444" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.kind).toBe("SITE_TO_SITE");
    expect(body.sourceSiteId).toBe("44444444-4444-4444-8444-444444444444");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { materialSizeId: ["This Material Size does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createMovementAction({}, formData(validFields));

    expect(result.errors?.materialSizeId).toEqual(["This Material Size does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createMovementAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Movement. Please try again.");
  });
});
