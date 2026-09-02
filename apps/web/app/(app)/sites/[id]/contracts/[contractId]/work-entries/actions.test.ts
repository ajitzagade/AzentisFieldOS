import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWorkEntryAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;
const CONTRACT_ID = "11111111-1111-4111-8111-111111111111";

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

describe("createWorkEntryAction", () => {
  it("rejects a non-positive quantity without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createWorkEntryAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, quantity: "0", workDate: "2026-09-08" }),
    );

    expect(result.errors?.quantity).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts a new entry and redirects to the Site Contract detail page", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createWorkEntryAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, quantity: "260", workDate: "2026-09-08" }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/subcontractor-work-entries",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/sites\/s1\/contracts\/c1\?flash=Work%20Entry%20recorded/),
    );
  });

  it("uses a distinct flash message for a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createWorkEntryAction(
      "s1",
      "c1",
      {},
      formData({
        siteContractId: CONTRACT_ID,
        quantity: "-20",
        workDate: "2026-09-08",
        correctsId: CONTRACT_ID,
        reason: "Miscounted",
      }),
    );

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/correction%20recorded/));
  });

  it("surfaces a non-schema 400 (e.g. contract not Active) as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "CONTRACT_NOT_ACTIVE", message: "Work Entries can only be recorded against an Active Site Contract" } }),
    }) as unknown as typeof fetch;

    const result = await createWorkEntryAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, quantity: "10", workDate: "2026-09-08" }),
    );

    expect(result.formError).toBe("Work Entries can only be recorded against an Active Site Contract");
  });
});
