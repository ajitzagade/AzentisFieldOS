import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { createTeamMemberAction } from "./actions";

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

describe("createTeamMemberAction", () => {
  it("returns a per-field error for a missing name, without calling the API", async () => {
    global.fetch = vi.fn();

    const result = await createTeamMemberAction({}, formData({ employmentTypeId: "11111111-1111-4111-8111-111111111111" }));

    expect(result.errors?.name).toBeDefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("posts the validated payload (optional fields omitted) and redirects to /team on success", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createTeamMemberAction({}, formData({ name: "Ravi Kumar", employmentTypeId: "11111111-1111-4111-8111-111111111111" })),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/team-members",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Ravi Kumar", employmentTypeId: "11111111-1111-4111-8111-111111111111" }),
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith(expect.stringMatching(/^\/team\?flash=/));
  });

  it("includes optional designation/contact when provided", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 201 }) as unknown as typeof fetch;

    await expect(
      createTeamMemberAction(
        {},
        formData({
          name: "Ravi Kumar",
          designation: "Bar Bender",
          contact: "+91 98765 43210",
          employmentTypeId: "11111111-1111-4111-8111-111111111111",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const body = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![1].body);
    expect(body.designation).toBe("Bar Bender");
    expect(body.contact).toBe("+91 98765 43210");
  });

  it("surfaces the API's field errors when the API returns 400", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { details: { fieldErrors: { employmentTypeId: ["This Employment Type does not exist"] } } } }),
    }) as unknown as typeof fetch;

    const result = await createTeamMemberAction(
      {},
      formData({ name: "Ravi Kumar", employmentTypeId: "11111111-1111-4111-8111-111111111111" }),
    );

    expect(result.errors?.employmentTypeId).toEqual(["This Employment Type does not exist"]);
  });

  it("returns a generic form error for a non-400 failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const result = await createTeamMemberAction(
      {},
      formData({ name: "Ravi Kumar", employmentTypeId: "11111111-1111-4111-8111-111111111111" }),
    );

    expect(result.formError).toBe("Something went wrong creating the Team Member. Please try again.");
  });
});
