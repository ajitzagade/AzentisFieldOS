import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateMaterialAction } from "./actions";

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

describe("updateMaterialAction", () => {
  it("posts only the changed fields to PATCH /materials/:id and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMaterialAction("mat-1", {}, formData({ name: "RCC Pipe (renamed)", isActive: "true" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/materials/mat-1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/materials");
  });

  it("returns a clear form error, not a raw 404, when the Material no longer exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateMaterialAction("missing", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Material no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces a foreign-key-violation 400 as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "This Material references a Category or Unit that does not exist" } }),
    }) as unknown as typeof fetch;

    const result = await updateMaterialAction("mat-1", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Material references a Category or Unit that does not exist");
  });

  it("parses the JSON-encoded customFields hidden field and includes it in the PATCH body (AC #1)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMaterialAction(
      "mat-1",
      {},
      formData({ isActive: "true", customFields: JSON.stringify([{ label: "Brand", type: "TEXT" }]) }),
    );

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.customFields).toEqual([{ label: "Brand", type: "TEXT" }]);
  });

  it("returns a form error instead of throwing on malformed customFields JSON", async () => {
    global.fetch = vi.fn();

    const result = await updateMaterialAction("mat-1", {}, formData({ isActive: "true", customFields: "{not valid json" }));

    expect(result.formError).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects an unknown customFields type as a per-field validation error, not a raw 500", async () => {
    global.fetch = vi.fn();

    const result = await updateMaterialAction(
      "mat-1",
      {},
      formData({ isActive: "true", customFields: JSON.stringify([{ label: "Brand", type: "STRING" }]) }),
    );

    expect(result.errors?.customFields).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("Story 5.7: includes the lowStockThreshold as a number when set", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMaterialAction("mat-1", {}, formData({ isActive: "true", lowStockThreshold: "200" }));

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.lowStockThreshold).toBe(200);
  });

  it("Story 5.7: sends lowStockThreshold as null when the field is left blank (clears it, doesn't omit it)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateMaterialAction("mat-1", {}, formData({ isActive: "true", lowStockThreshold: "" }));

    const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((call?.[1] as RequestInit).body as string);
    expect(body.lowStockThreshold).toBeNull();
  });
});
