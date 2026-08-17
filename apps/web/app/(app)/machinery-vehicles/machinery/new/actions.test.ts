import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createMachineryAction } from "./actions";

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

describe("createMachineryAction", () => {
  it("returns a per-field error for a missing name, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createMachineryAction(
      {},
      formData({ typeId: validTypeId, assetNumber: "AST-001" }),
    );

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload (optional fields omitted) and redirects to /machinery-vehicles on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createMachineryAction(
        {},
        formData({ name: "JCB 3DX", typeId: validTypeId, assetNumber: "AST-001" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/machinery",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "JCB 3DX", typeId: validTypeId, assetNumber: "AST-001" }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles");
  });

  it("includes optional model/ownership/operator when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createMachineryAction(
        {},
        formData({
          name: "JCB 3DX",
          typeId: validTypeId,
          assetNumber: "AST-001",
          model: "3DX",
          ownership: "Owned",
          operator: "Ramesh",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.model).toBe("3DX");
    expect(body.ownership).toBe("Owned");
    expect(body.operator).toBe("Ramesh");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { typeId: ["This Machinery Type does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createMachineryAction(
      {},
      formData({ name: "JCB 3DX", typeId: validTypeId, assetNumber: "AST-001" }),
    );

    expect(result.errors?.typeId).toEqual(["This Machinery Type does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createMachineryAction(
      {},
      formData({ name: "JCB 3DX", typeId: validTypeId, assetNumber: "AST-001" }),
    );

    expect(result.formError).toBe("Something went wrong registering the Machine. Please try again.");
  });
});
