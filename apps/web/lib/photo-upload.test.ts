import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadPhoto } from "./photo-upload";
import type { AuthedFetch } from "./authed-fetch-core";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function fakeFile(): File {
  return new File(["fake-bytes"], "site.jpg", { type: "image/jpeg" });
}

// Story 1.8: the API calls (presign, confirm) now go through the shared
// authed-fetch helper (Clerk token attached), which takes a PATH and resolves
// it against apps/api. The direct-to-R2 PUT must stay a raw `fetch` with no
// Authorization header — the presigned URL is its own bearer of authority.
describe("uploadPhoto", () => {
  it("presigns + confirms via the authed helper, and PUTs the file directly to R2 with a raw fetch (no auth)", async () => {
    const authedCalls: string[] = [];
    const authedFetch = vi.fn(async (path: string) => {
      authedCalls.push(path);
      if (path === "/photos/presign") {
        return {
          ok: true,
          json: async () => ({ uploadUrl: "https://r2.example/put?sig=abc", storageKey: "dsr/dsr-1/x.jpg" }),
        } as Response;
      }
      if (path === "/photos") {
        return { ok: true, json: async () => ({ id: "photo-1" }) } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;

    const putCalls: { url: string; method?: string }[] = [];
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      putCalls.push({ url: String(url), method: init?.method });
      return Promise.resolve({ ok: true } as Response);
    }) as unknown as typeof fetch;

    const result = await uploadPhoto(authedFetch, "dsr-1", fakeFile());

    expect(result).toEqual({ storageKey: "dsr/dsr-1/x.jpg" });
    expect(authedCalls).toEqual(["/photos/presign", "/photos"]);
    expect(putCalls).toEqual([{ url: "https://r2.example/put?sig=abc", method: "PUT" }]);
  });

  it("throws when the presign step fails", async () => {
    const authedFetch = vi.fn(async () => ({ ok: false }) as Response) as unknown as AuthedFetch;
    await expect(uploadPhoto(authedFetch, "dsr-1", fakeFile())).rejects.toThrow();
  });

  it("throws when the direct-to-R2 PUT fails, without confirming", async () => {
    const authedFetch = vi.fn(async (path: string) => {
      if (path === "/photos/presign") {
        return { ok: true, json: async () => ({ uploadUrl: "https://r2.example/put", storageKey: "k" }) } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;
    global.fetch = vi.fn(() => Promise.resolve({ ok: false } as Response)) as unknown as typeof fetch;

    await expect(uploadPhoto(authedFetch, "dsr-1", fakeFile())).rejects.toThrow();
  });
});
