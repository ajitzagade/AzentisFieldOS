import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createUnitAction, renameUnitAction, toggleUnitAction } from "./actions";

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

describe("createUnitAction", () => {
  it("returns a per-field error for a missing name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createUnitAction({}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    const result = await createUnitAction({}, formData({ name: "Bags" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/units",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Bags" }) }),
    );
    expect(result).toEqual({});
  });
});

describe("renameUnitAction", () => {
  it("returns a per-field error for an empty name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await renameUnitAction("u1", {}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PATCHes the id with the validated payload and returns ok:true", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    const result = await renameUnitAction("u1", {}, formData({ name: "Kilograms" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/units/u1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ name: "Kilograms" }) }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("surfaces a duplicate-name 400 as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "A Unit with this name already exists" } }),
    }) as unknown as typeof fetch;

    const result = await renameUnitAction("u1", {}, formData({ name: "Bags" }));

    expect(result.formError).toBe("A Unit with this name already exists");
  });
});

describe("toggleUnitAction", () => {
  it("PATCHes isActive and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    const result = await toggleUnitAction("u1", false);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/units/u1",
      expect.objectContaining({ method: "PATCH", body: JSON.stringify({ isActive: false }) }),
    );
    expect(result).toEqual({});
  });

  it("surfaces a failed toggle as a form error instead of silently no-opping", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await toggleUnitAction("u1", false);

    expect(result.formError).toBe("Could not disable this Unit. Please try again.");
  });
});
