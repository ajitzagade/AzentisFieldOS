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
  it("posts only the changed fields to PATCH /team-members/:id and redirects on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as unknown as typeof fetch;

    await updateTeamMemberAction("tm1", {}, formData({ name: "Ravi Kumar (renamed)", isActive: "true" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/team-members/tm1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(redirectMock).toHaveBeenCalledWith("/team");
  });

  it("returns a clear form error, not a raw 404, when the Team Member no longer exists", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 }) as unknown as typeof fetch;

    const result = await updateTeamMemberAction("missing", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Team Member no longer exists.");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("surfaces a foreign-key-violation 400 as a form error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "This Team Member references an Employment Type that does not exist" } }),
    }) as unknown as typeof fetch;

    const result = await updateTeamMemberAction("tm1", {}, formData({ isActive: "true" }));

    expect(result.formError).toBe("This Team Member references an Employment Type that does not exist");
  });
});
