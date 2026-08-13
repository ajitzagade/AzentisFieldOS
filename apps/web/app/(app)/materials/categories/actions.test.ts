import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createMaterialCategoryAction, toggleMaterialCategoryAction } from "./actions";

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

describe("createMaterialCategoryAction", () => {
  it("returns a per-field error for a missing name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createMaterialCategoryAction({}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    const result = await createMaterialCategoryAction({}, formData({ name: "Cement" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/material-categories",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Cement" }) }),
    );
    expect(result).toEqual({});
  });
});

describe("toggleMaterialCategoryAction", () => {
  it("PATCHes isActive to the given value and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;

    const result = await toggleMaterialCategoryAction("cat-1", false);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/material-categories/cat-1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ isActive: false }) }),
    );
    expect(result).toEqual({});
  });

  it("returns a form error instead of silently no-opping when the PATCH fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await toggleMaterialCategoryAction("cat-1", false);

    expect(result.formError).toBe("Could not disable this Category. Please try again.");
  });

  it("returns an enable-specific form error when enabling fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await toggleMaterialCategoryAction("cat-1", true);

    expect(result.formError).toBe("Could not enable this Category. Please try again.");
  });
});
