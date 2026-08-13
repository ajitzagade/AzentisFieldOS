import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { createUnitAction } from "./actions";

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
