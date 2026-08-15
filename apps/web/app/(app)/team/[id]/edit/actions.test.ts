import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { updateTeamMemberAction } from "./actions";

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

describe("updateTeamMemberAction", () => {
  it("posts the full form state (every field, not a diff) to PATCH /team-members/:id and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateTeamMemberAction("tm1", {}, formData({ name: "Ravi Kumar (renamed)", isActive: "true" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/team-members/tm1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/team");
  });

  it("sends an explicit null (not an omitted key) for a blanked Designation/Contact, so the API actually clears it", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateTeamMemberAction("tm1", {}, formData({ name: "Ravi Kumar", isActive: "true" }));

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.designation).toBeNull();
    expect(body.contact).toBeNull();
  });

  it("returns a clear form error, not a raw 404, when the Team Member no longer exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateTeamMemberAction("missing", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Team Member no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces a foreign-key-violation 400 as a form error, reading Nest's real BadRequestException(string) body shape", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "This Team Member references an Employment Type that does not exist",
        error: "Bad Request",
      }),
    }) as unknown as typeof fetch;

    const result = await updateTeamMemberAction("tm1", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Team Member references an Employment Type that does not exist");
  });

  it("returns a generic form error instead of throwing when the fetch itself rejects (network failure)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await updateTeamMemberAction("tm1", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("Something went wrong updating the Team Member. Please try again.");
  });

  it("returns the generic fallback instead of throwing when a 400 response body isn't valid JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    }) as unknown as typeof fetch;

    const result = await updateTeamMemberAction("tm1", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Team Member references an Employment Type that does not exist.");
  });
});
