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

const signed = {
  uploadUrl: "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
  apiKey: "test-key",
  timestamp: 1735689600,
  signature: "test-signature",
  publicId: "dsr/dsr-1/abc",
  storageKey: "dsr/dsr-1/abc",
};

// Story 1.8: the API calls (presign, confirm) now go through the shared
// authed-fetch helper (Clerk token attached), which takes a PATH and resolves
// it against apps/api. The direct-to-Cloudinary POST must stay a raw `fetch`
// with no Authorization header — the signed request is its own bearer of
// authority.
describe("uploadPhoto", () => {
  it("presigns + confirms via the authed helper, and POSTs a multipart form directly to Cloudinary with a raw fetch (no auth)", async () => {
    const authedCalls: { path: string; body: unknown }[] = [];
    const authedFetch = vi.fn(async (path: string, init?: RequestInit) => {
      authedCalls.push({ path, body: init?.body });
      if (path === "/photos/presign") {
        return { ok: true, json: async () => signed } as Response;
      }
      if (path === "/photos") {
        return { ok: true, json: async () => ({ id: "photo-1" }) } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;

    const postCalls: { url: string; method?: string; body?: unknown }[] = [];
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      postCalls.push({ url: String(url), method: init?.method, body: init?.body });
      return Promise.resolve({
        ok: true,
        json: async () => ({
          public_id: "dsr/dsr-1/abc",
          secure_url:
            "https://res.cloudinary.com/test-cloud/image/upload/dsr/dsr-1/abc",
        }),
      } as Response);
    }) as unknown as typeof fetch;

    const result = await uploadPhoto(authedFetch, "dsr-1", fakeFile());

    expect(result).toEqual({ storageKey: "dsr/dsr-1/abc" });
    expect(authedCalls.map((c) => c.path)).toEqual([
      "/photos/presign",
      "/photos",
    ]);
    // confirm carries the Cloudinary-returned public_id as storageKey
    expect(JSON.parse(authedCalls[1].body as string)).toEqual({
      dailySiteReportId: "dsr-1",
      storageKey: "dsr/dsr-1/abc",
    });
    // one direct POST to Cloudinary, multipart form, no Authorization header
    expect(postCalls).toHaveLength(1);
    expect(postCalls[0].url).toBe(signed.uploadUrl);
    expect(postCalls[0].method).toBe("POST");
    const form = postCalls[0].body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("api_key")).toBe("test-key");
    expect(form.get("timestamp")).toBe("1735689600");
    expect(form.get("signature")).toBe("test-signature");
    expect(form.get("public_id")).toBe("dsr/dsr-1/abc");
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("throws when the presign step fails", async () => {
    const authedFetch = vi.fn(async () => ({ ok: false }) as Response) as unknown as AuthedFetch;
    await expect(uploadPhoto(authedFetch, "dsr-1", fakeFile())).rejects.toThrow();
  });

  it("throws when the direct-to-Cloudinary POST fails, without confirming", async () => {
    const authedFetch = vi.fn(async (path: string) => {
      if (path === "/photos/presign") {
        return { ok: true, json: async () => signed } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;
    global.fetch = vi.fn(() => Promise.resolve({ ok: false } as Response)) as unknown as typeof fetch;

    await expect(uploadPhoto(authedFetch, "dsr-1", fakeFile())).rejects.toThrow();
  });
});
