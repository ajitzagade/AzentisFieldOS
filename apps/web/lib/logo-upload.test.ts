import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadBrandingLogo } from "./logo-upload";
import type { AuthedFetch } from "./authed-fetch-core";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function fakeFile(): File {
  return new File(["logo-bytes"], "logo.png", { type: "image/png" });
}

const signed = {
  uploadUrl: "https://api.cloudinary.com/v1_1/test-cloud/image/upload",
  apiKey: "test-key",
  timestamp: 1735689600,
  signature: "test-signature",
  publicId: "branding/logo/abc",
  storageKey: "branding/logo/abc",
  allowedFormats: "jpg,jpeg,png,svg",
  logoUrl:
    "https://res.cloudinary.com/test-cloud/image/upload/branding/logo/abc",
};

// Story 14.1 (AD-3): the presign goes through the authed helper (session token);
// the direct-to-Cloudinary POST is a raw multipart `fetch` carrying only the
// signature, and the returned secure_url is the durable logoUrl to persist.
describe("uploadBrandingLogo", () => {
  it("presigns via the authed helper, POSTs a multipart form to Cloudinary, and returns the secure_url", async () => {
    const authedFetch = vi.fn(async (path: string) => {
      if (path === "/branding-config/logo/presign") {
        return { ok: true, json: async () => signed } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;

    const postCalls: { url: string; method?: string; body?: unknown }[] = [];
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      postCalls.push({ url: String(url), method: init?.method, body: init?.body });
      return Promise.resolve({
        ok: true,
        json: async () => ({
          public_id: "branding/logo/abc",
          secure_url: signed.logoUrl,
        }),
      } as Response);
    }) as unknown as typeof fetch;

    const result = await uploadBrandingLogo(authedFetch, fakeFile());

    expect(result).toEqual({ logoUrl: signed.logoUrl });
    expect(postCalls).toHaveLength(1);
    const post = postCalls[0]!;
    expect(post.url).toBe(signed.uploadUrl);
    expect(post.method).toBe("POST");
    const form = post.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("signature")).toBe("test-signature");
    expect(form.get("public_id")).toBe("branding/logo/abc");
    expect(form.get("allowed_formats")).toBe("jpg,jpeg,png,svg");
    expect(form.get("file")).toBeInstanceOf(File);
  });

  it("throws when the presign step fails", async () => {
    const authedFetch = vi.fn(async () => ({ ok: false }) as Response) as unknown as AuthedFetch;
    await expect(uploadBrandingLogo(authedFetch, fakeFile())).rejects.toThrow();
  });

  it("throws when the direct-to-Cloudinary POST fails", async () => {
    const authedFetch = vi.fn(async (path: string) => {
      if (path === "/branding-config/logo/presign") {
        return { ok: true, json: async () => signed } as Response;
      }
      return { ok: false } as Response;
    }) as unknown as AuthedFetch;
    global.fetch = vi.fn(() => Promise.resolve({ ok: false } as Response)) as unknown as typeof fetch;

    await expect(uploadBrandingLogo(authedFetch, fakeFile())).rejects.toThrow();
  });
});
