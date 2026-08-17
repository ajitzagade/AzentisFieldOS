import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createVehicleTypeAction } from "./actions";

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

describe("createVehicleTypeAction", () => {
  it("returns a per-field error for a missing name without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createVehicleTypeAction({}, formData({ name: "" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and returns an empty (success) state", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    const result = await createVehicleTypeAction({}, formData({ name: "Tempo" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vehicle-types",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "Tempo" }) }),
    );
    expect(result).toEqual({});
  });

  it("surfaces a duplicate-name 400 as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "A Vehicle Type with this name already exists" } }),
    }) as unknown as typeof fetch;

    const result = await createVehicleTypeAction({}, formData({ name: "Truck" }));

    expect(result.formError).toBe("A Vehicle Type with this name already exists");
  });
});
