import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createAssetMovementAction, createServiceLogAction, updateServiceLogAction } from "./actions";

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

const validFields = {
  assetType: "MACHINERY",
  assetId: "11111111-1111-4111-8111-111111111111",
  toStatus: "AT_SITE",
  siteId: "22222222-2222-4222-8222-222222222222",
  movedAt: "2026-08-15",
};

describe("createAssetMovementAction", () => {
  it("rejects an invalid payload without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createAssetMovementAction({}, formData({ ...validFields, toStatus: "AT_SITE", siteId: "" }));

    expect(result.errors?.siteId).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to the Machine's detail page on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createAssetMovementAction({}, formData(validFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.assetType).toBe("MACHINERY");
    expect(body.toStatus).toBe("AT_SITE");
    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles/machinery/11111111-1111-4111-8111-111111111111");
  });

  it("redirects to the Vehicle's detail page for a VEHICLE movement", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createAssetMovementAction({}, formData({ ...validFields, assetType: "VEHICLE", toStatus: "MAINTENANCE", siteId: "" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles/vehicles/11111111-1111-4111-8111-111111111111");
  });

  it("omits siteId from the payload for a MAINTENANCE/AVAILABLE movement even if the form somehow retained one", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createAssetMovementAction({}, formData({ ...validFields, toStatus: "MAINTENANCE" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.siteId).toBeUndefined();
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { siteId: ["This Site does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createAssetMovementAction({}, formData(validFields));

    expect(result.errors?.siteId).toEqual(["This Site does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createAssetMovementAction({}, formData(validFields));

    expect(result.formError).toBe("Something went wrong recording the Movement. Please try again.");
  });
});

const validServiceLogFields = {
  assetType: "MACHINERY",
  assetId: "11111111-1111-4111-8111-111111111111",
  kind: "FUEL",
  serviceDate: "2026-08-15",
};

describe("createServiceLogAction", () => {
  it("rejects an invalid payload without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createServiceLogAction({}, formData({ ...validServiceLogFields, kind: "OIL_CHANGE" }));

    expect(result.errors?.kind).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload and redirects to the Machine's detail page on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createServiceLogAction({}, formData(validServiceLogFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.assetType).toBe("MACHINERY");
    expect(body.kind).toBe("FUEL");
    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles/machinery/11111111-1111-4111-8111-111111111111");
  });

  it("redirects to the Vehicle's detail page for a VEHICLE entry", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createServiceLogAction({}, formData({ ...validServiceLogFields, assetType: "VEHICLE", kind: "REPAIR" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles/vehicles/11111111-1111-4111-8111-111111111111");
  });

  it("omits notes/cost from the payload when left blank", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(createServiceLogAction({}, formData(validServiceLogFields))).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.notes).toBeUndefined();
    expect(body.cost).toBeUndefined();
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { assetId: ["This Machine does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createServiceLogAction({}, formData(validServiceLogFields));

    expect(result.errors?.assetId).toEqual(["This Machine does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createServiceLogAction({}, formData(validServiceLogFields));

    expect(result.formError).toBe("Something went wrong logging this entry. Please try again.");
  });
});

describe("updateServiceLogAction", () => {
  it("rejects an invalid payload without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await updateServiceLogAction(
      "log1",
      "MACHINERY",
      {},
      formData({ ...validServiceLogFields, kind: "OIL_CHANGE" }),
    );

    expect(result.errors?.kind).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("PATCHes /asset-service-logs/:id?assetType= with the validated body and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await expect(
      updateServiceLogAction("log1", "MACHINERY", {}, formData(validServiceLogFields)),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toBe("http://localhost:3001/asset-service-logs/log1?assetType=MACHINERY");
    expect(init.method).toBe("PATCH");
    const body = JSON.parse(init.body);
    expect(body.kind).toBe("FUEL");
    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles/machinery/11111111-1111-4111-8111-111111111111");
  });

  it("sends an explicit null for a blanked optional field rather than omitting it", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await expect(
      updateServiceLogAction(
        "log1",
        "VEHICLE",
        {},
        formData({ ...validServiceLogFields, assetId: "22222222-2222-4222-8222-222222222222" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.notes).toBeNull();
    expect(body.cost).toBeNull();
  });

  it("returns a formError when the entry no longer exists (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateServiceLogAction("log1", "MACHINERY", {}, formData(validServiceLogFields));

    expect(result.formError).toBe("This Service Log entry no longer exists.");
  });
});
