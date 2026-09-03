import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMaterialAction, createMaterialQuickAction } from "./actions";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

const revalidatePathMock = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const originalFetch = global.fetch;
const originalApiUrl = process.env.API_URL;
const validUuid = "123e4567-e89b-42d3-a456-426614174000";

beforeEach(() => {
  process.env.API_URL = "http://localhost:3001";
  redirectMock.mockClear();
  revalidatePathMock.mockClear();
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
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: "material-1", name: "RCC Pipe" }),
    }) as unknown as typeof fetch;

    await createMaterialAction({}, formData({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/materials",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/materials\?flash=/));
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

describe("createMaterialQuickAction", () => {
  function quickFormData(overrides: Record<string, string> = {}) {
    return formData({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid, sizeLabel: "300mm", ...overrides });
  }

  it("returns per-field errors for a missing Size without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createMaterialQuickAction({}, quickFormData({ sizeLabel: "" }));

    expect(result.errors?.sizeLabel).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("creates the Material then its first Size, and returns { success, id, name } as the Size — not the bare Material", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "http://localhost:3001/materials") {
        return Promise.resolve({ ok: true, status: 201, json: async () => ({ id: "material-1", name: "RCC Pipe" }) });
      }
      if (url === "http://localhost:3001/materials/material-1/sizes") {
        return Promise.resolve({ ok: true, status: 201, json: async () => ({ id: "size-1", label: "300mm" }) });
      }
      throw new Error(`Unexpected URL ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createMaterialQuickAction({}, quickFormData());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/materials",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "RCC Pipe", categoryId: validUuid, unitId: validUuid }) }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/materials/material-1/sizes",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ label: "300mm" }) }),
    );
    expect(result).toEqual({ success: true, id: "size-1", name: "RCC Pipe — 300mm" });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/materials");
    expect(revalidatePathMock).toHaveBeenCalledWith("/movements/purchases/new");
  });

  it("surfaces the same foreign-key-violation formError as the full form, without attempting the Size call", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "This Material references a Category or Unit that does not exist" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createMaterialQuickAction({}, quickFormData());

    expect(result.formError).toBe("This Material references a Category or Unit that does not exist");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("surfaces a failure to add the Size as a formError explaining the Material was still created", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url === "http://localhost:3001/materials") {
        return Promise.resolve({ ok: true, status: 201, json: async () => ({ id: "material-1", name: "RCC Pipe" }) });
      }
      return Promise.resolve({ ok: false, status: 500 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const result = await createMaterialQuickAction({}, quickFormData());

    expect(result.formError).toBe("The Material was created, but its Size could not be added. Please try again.");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
