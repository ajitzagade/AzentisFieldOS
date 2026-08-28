import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { updateMachineryAction } from "./actions";

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

const validTypeId = "11111111-1111-4111-8111-111111111111";

describe("updateMachineryAction", () => {
  it("posts the full form state (every field, not a diff) to PATCH /machinery/:id and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMachineryAction(
      "m1",
      {},
      formData({ name: "JCB 3DX (renamed)", typeId: validTypeId, assetNumber: "AST-001" }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/machinery/m1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/machinery-vehicles\?flash=/));
  });

  it("sends an explicit null (not an omitted key) for a blanked Model/Ownership/Operator, so the API actually clears it", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMachineryAction("m1", {}, formData({ name: "JCB 3DX", typeId: validTypeId, assetNumber: "AST-001" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.model).toBeNull();
    expect(body.ownership).toBeNull();
    expect(body.operator).toBeNull();
    expect(body).not.toHaveProperty("currentStatus");
    expect(body).not.toHaveProperty("currentSiteId");
  });

  it("returns a clear form error, not a raw 404, when the Machine no longer exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateMachineryAction("missing", {}, formData({ name: "X" }));

    expect(result.formError).toBe("This Machine no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces a foreign-key-violation 400 as a form error, reading Nest's real BadRequestException(string) body shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "This Machine references a Machinery Type that does not exist",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await updateMachineryAction("m1", {}, formData({ name: "JCB 3DX" }));

    expect(result.formError).toBe("This Machine references a Machinery Type that does not exist");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await updateMachineryAction("m1", {}, formData({ name: "JCB 3DX" }));

    expect(result.formError).toBe("Something went wrong updating the Machine. Please try again.");
  });
});
