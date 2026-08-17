import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createVehicleAction } from "./actions";

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

describe("createVehicleAction", () => {
  it("returns a per-field error for a missing number, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createVehicleAction({}, formData({ typeId: validTypeId }));

    expect(result.errors?.number).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload (optional fields omitted) and redirects to /machinery-vehicles on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createVehicleAction({}, formData({ number: "MH-12-AB-1234", typeId: validTypeId })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/vehicles",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ number: "MH-12-AB-1234", typeId: validTypeId }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/machinery-vehicles");
  });

  it("includes optional ownership/driver when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createVehicleAction(
        {},
        formData({ number: "MH-12-AB-1234", typeId: validTypeId, ownership: "Rented", driver: "Suresh" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.ownership).toBe("Rented");
    expect(body.driver).toBe("Suresh");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { typeId: ["This Vehicle Type does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createVehicleAction({}, formData({ number: "MH-12-AB-1234", typeId: validTypeId }));

    expect(result.errors?.typeId).toEqual(["This Vehicle Type does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createVehicleAction({}, formData({ number: "MH-12-AB-1234", typeId: validTypeId }));

    expect(result.formError).toBe("Something went wrong registering the Vehicle. Please try again.");
  });
});
