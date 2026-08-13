import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { addMaterialSizeAction } from "./add-size-action";

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
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

describe("addMaterialSizeAction", () => {
  it("returns a per-field error for a missing label without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await addMaterialSizeAction("mat-1", {}, formData({ label: "" }));

    expect(result.errors?.label).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the label to POST /materials/:materialId/sizes and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    const result = await addMaterialSizeAction("mat-1", {}, formData({ label: "300mm" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/materials/mat-1/sizes",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ label: "300mm" }) }),
    );
    expect(result).toEqual({});
  });

  it("surfaces a duplicate-Size 400 as a form error, not a raw constraint string (AC #2)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "This Size already exists for this Material" } }),
    }) as unknown as typeof fetch;

    const result = await addMaterialSizeAction("mat-1", {}, formData({ label: "300mm" }));

    expect(result.formError).toBe("This Size already exists for this Material");
  });
});
