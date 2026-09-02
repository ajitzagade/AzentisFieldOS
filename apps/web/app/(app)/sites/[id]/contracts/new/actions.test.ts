import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSiteContractAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

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

describe("createSiteContractAction", () => {
  it("returns a per-field error for a missing subcontractorId without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSiteContractAction({}, formData({ siteId: "11111111-1111-4111-8111-111111111111" }));

    expect(result.errors?.subcontractorId).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts a Draft Site Contract with no commercial terms and redirects to the Site", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "DRAFT" }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/site-contracts",
      expect.objectContaining({ method: "POST" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/sites\/11111111-1111-4111-8111-111111111111\?flash=/));
  });

  it("rejects a Per Pipe rate type submitted without a rate, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", rateType: "PER_PIPE" }),
    );

    expect(result.errors?.rate).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects activating a contract missing required terms, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "ACTIVE" }),
    );

    expect(result.errors?.workCategory).toBeDefined();
    expect(result.errors?.rateType).toBeDefined();
    expect(result.errors?.startDate).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts a complete Fixed Cost Active contract successfully", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createSiteContractAction(
      {},
      formData({
        siteId: "11111111-1111-4111-8111-111111111111",
        subcontractorId: "22222222-2222-4222-8222-222222222222",
        workCategory: "Electrical fit-out",
        rateType: "FIXED_COST",
        fixedAmount: "200000",
        startDate: "2026-09-08",
        status: "ACTIVE",
      }),
    );

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body).toMatchObject({ rateType: "FIXED_COST", fixedAmount: 200000, status: "ACTIVE" });
    expect(redirectMock).toHaveBeenCalled();
  });

  it("surfaces the API's per-field validation errors on a 400 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { workCategory: ["Too long"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "DRAFT" }),
    );

    expect(result.errors).toEqual({ workCategory: ["Too long"] });
  });

  it("maps a 403 to the Owner-only message", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "DRAFT" }),
    );

    expect(result.formError).toBe("Only an Owner/Admin can engage a Subcontractor.");
  });

  it("surfaces a plain-message 400 (e.g. Subcontractor/Site no longer exists) as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "This Subcontractor does not exist" }),
    }) as unknown as typeof fetch;

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "DRAFT" }),
    );

    expect(result.formError).toBe("This Subcontractor does not exist");
  });

  it("returns a form error instead of throwing on a network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await createSiteContractAction(
      {},
      formData({ siteId: "11111111-1111-4111-8111-111111111111", subcontractorId: "22222222-2222-4222-8222-222222222222", status: "DRAFT" }),
    );

    expect(result.formError).toBe("Something went wrong creating the Site Contract. Please try again.");
  });
});
