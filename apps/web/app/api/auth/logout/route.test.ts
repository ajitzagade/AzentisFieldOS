import { describe, expect, it, vi } from "vitest";

const deleteMock = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: deleteMock }),
}));

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie and redirects to /sign-in", async () => {
    const res = await POST(new Request("http://localhost/api/auth/logout"));

    expect(deleteMock).toHaveBeenCalledWith("session");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/sign-in");
  });
});
