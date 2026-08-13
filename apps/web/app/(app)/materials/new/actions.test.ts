import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMaterialAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;
const validUuid = "123e4567-e89b-42d3-a456-426614174000";

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

describe("createMaterialAction", () => {
  it("returns per-field errors for a missing required field without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createMaterialAction({}, formData({ name: "", categoryId: validUuid, unitId: validUuid }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload to the API and redirects to /materials on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await createMaterialAction({}, formData({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/materials",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/materials");
  });

  it("surfaces a foreign-key-violation 400 (non-existent Category/Unit) as a form error, not a raw status (AC #5)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "This Material references a Category or Unit that does not exist" } }),
    }) as unknown as typeof fetch;

    const result = await createMaterialAction({}, formData({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }));

    expect(result.formError).toBe("This Material references a Category or Unit that does not exist");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("returns a generic form error on a non-400 API failure, never a raw status", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createMaterialAction({}, formData({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }));

    expect(result.formError).toBe("Something went wrong creating the Material. Please try again.");
  });
});
