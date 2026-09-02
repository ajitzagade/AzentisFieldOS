import { afterEach, describe, expect, it, vi } from "vitest";

const deleteMock = vi.hoisted(() => vi.fn());
const getMock = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({
  cookies: async () => ({ delete: deleteMock, get: getMock }),
}));

import { POST } from "./route";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("POST /api/auth/logout", () => {
  it("revokes the refresh token, clears both cookies, and redirects to /sign-in", async () => {
    getMock.mockReturnValue({ value: "raw-refresh" });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(new Request("http://localhost/api/auth/logout"));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: "raw-refresh" }),
      }),
    );
    expect(deleteMock).toHaveBeenCalledWith("session");
    expect(deleteMock).toHaveBeenCalledWith("refresh_token");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/sign-in");
  });

  it("still clears cookies and redirects even if apps/api is unreachable", async () => {
    getMock.mockReturnValue({ value: "raw-refresh" });
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const res = await POST(new Request("http://localhost/api/auth/logout"));

    expect(deleteMock).toHaveBeenCalledWith("session");
    expect(deleteMock).toHaveBeenCalledWith("refresh_token");
    expect(res.status).toBe(307);
  });

  it("skips the revoke call when there is no refresh token cookie", async () => {
    getMock.mockReturnValue(undefined);
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await POST(new Request("http://localhost/api/auth/logout"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(deleteMock).toHaveBeenCalledWith("session");
    expect(deleteMock).toHaveBeenCalledWith("refresh_token");
  });
});
