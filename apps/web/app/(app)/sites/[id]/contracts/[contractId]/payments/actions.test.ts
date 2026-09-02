import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSubcontractorPaymentAction } from "./actions";

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

describe("createSubcontractorPaymentAction", () => {
  it("rejects a non-positive amount without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSubcontractorPaymentAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, type: "PAYMENT", amount: "0", paidAt: "2026-09-03" }),
    );

    expect(result.errors?.amount).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts an Advance that exceeds no cap and redirects to the Site Contract detail page", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createSubcontractorPaymentAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, type: "ADVANCE", amount: "1000000", paidAt: "2026-09-03" }),
    );

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body).toMatchObject({ type: "ADVANCE", amount: 1000000 });
    expect(redirectMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/sites\/s1\/contracts\/c1\?flash=Payment%20recorded/),
    );
  });

  it("maps a 403 to the Owner-only message", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await createSubcontractorPaymentAction(
      "s1",
      "c1",
      {},
      formData({ siteContractId: CONTRACT_ID, type: "PAYMENT", amount: "5000", paidAt: "2026-09-03" }),
    );

    expect(result.formError).toBe("Only an Owner/Admin can record a Subcontractor Payment.");
  });

  it("uses a distinct flash message for a correction", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createSubcontractorPaymentAction(
      "s1",
      "c1",
      {},
      formData({
        siteContractId: CONTRACT_ID,
        type: "PAYMENT",
        amount: "-500",
        paidAt: "2026-09-03",
        correctsId: CONTRACT_ID,
        reason: "Typo",
      }),
    );

    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/correction%20recorded/));
  });
});
