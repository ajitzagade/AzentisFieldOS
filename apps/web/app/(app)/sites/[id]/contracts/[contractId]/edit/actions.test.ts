import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateSiteContractAction } from "./actions";

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

describe("updateSiteContractAction", () => {
  it("posts the validated payload and redirects to the contract detail page on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSiteContractAction("s1", "c1", {}, formData({ status: "DRAFT" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/site-contracts/c1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(
      expect.stringMatching(/^\/sites\/s1\/contracts\/c1\?flash=/),
    );
  });

  it("sends an intentionally-blanked optional field as an explicit null", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSiteContractAction("s1", "c1", {}, formData({ status: "DRAFT", description: "" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string);
    expect(body.description).toBeNull();
  });

  it("surfaces the merged ACTIVE-requires-terms rejection from the API the same way as a Zod 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { rate: ["Rate is required to activate this contract"] } } } }),
    }) as unknown as typeof fetch;

    const result = await updateSiteContractAction("s1", "c1", {}, formData({ status: "ACTIVE" }));

    expect(result.errors).toEqual({ rate: ["Rate is required to activate this contract"] });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a not-found form error on a 404 response", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateSiteContractAction("s1", "missing", {}, formData({ status: "DRAFT" }));

    expect(result.formError).toBe("This Site Contract no longer exists.");
  });

  it("never sends subcontractorId — the engaged Subcontractor is not reassignable via this form, even if a value was submitted", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateSiteContractAction(
      "s1",
      "c1",
      {},
      formData({ status: "DRAFT", subcontractorId: "a-different-subcontractor" }),
    );

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body as string) as Record<string, unknown>;
    expect(body).not.toHaveProperty("subcontractorId");
  });

  it("maps a 403 to the Owner-only message", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 }) as unknown as typeof fetch;

    const result = await updateSiteContractAction("s1", "c1", {}, formData({ status: "DRAFT" }));

    expect(result.formError).toBe("Only an Owner/Admin can edit a Site Contract.");
  });
});
