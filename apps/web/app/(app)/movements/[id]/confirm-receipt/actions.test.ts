import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { confirmMovementReceiptAction } from "./actions";

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

describe("confirmMovementReceiptAction", () => {
  it("returns a per-field error for a negative receivedQuantity, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await confirmMovementReceiptAction("m1", {}, formData({ receivedQuantity: "-1" }));

    expect(result.errors?.receivedQuantity).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PATCHes the bound Movement id and redirects to /movements on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    await expect(confirmMovementReceiptAction("m1", {}, formData({ receivedQuantity: "90" }))).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/movements/m1/confirm-receipt",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ receivedQuantity: 90 }) }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/movements\?flash=/));
  });

  it("returns a form error when the API rejects a double confirmation", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "Movement m1 has already had its receipt confirmed" } }),
    }) as unknown as typeof fetch;

    const result = await confirmMovementReceiptAction("m1", {}, formData({ receivedQuantity: "90" }));

    expect(result.formError).toBe("Movement m1 has already had its receipt confirmed");
  });

  it("returns a not-found form error for a 404", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await confirmMovementReceiptAction("missing", {}, formData({ receivedQuantity: "90" }));

    expect(result.formError).toBe("This Movement no longer exists.");
  });
});
