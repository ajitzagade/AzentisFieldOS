import { afterEach, describe, expect, it, vi } from "vitest";
import { uploadPhoto } from "./photo-upload";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

function fakeFile(): File {
  return new File(["fake-bytes"], "site.jpg", { type: "image/jpeg" });
}

describe("uploadPhoto", () => {
  it("presigns, PUTs the file directly to R2 (not through the API), then confirms", async () => {
    const calls: { url: string; method?: string }[] = [];
    global.fetch = vi.fn((url: string, init?: RequestInit) => {
      calls.push({ url: String(url), method: init?.method });
      if (String(url).endsWith("/photos/presign")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ uploadUrl: "https://r2.example/put?sig=abc", storageKey: "dsr/dsr-1/x.jpg" }),
        });
      }
      if (String(url) === "https://r2.example/put?sig=abc") {
        return Promise.resolve({ ok: true });
      }
      if (String(url).endsWith("/photos")) {
        return Promise.resolve({ ok: true, json: async () => ({ id: "photo-1" }) });
      }
      return Promise.resolve({ ok: false });
    }) as unknown as typeof fetch;

    const result = await uploadPhoto("http://localhost:3001", "dsr-1", fakeFile());

    expect(result).toEqual({ storageKey: "dsr/dsr-1/x.jpg" });
    expect(calls.map((c) => c.url)).toEqual([
      "http://localhost:3001/photos/presign",
      "https://r2.example/put?sig=abc",
      "http://localhost:3001/photos",
    ]);
    expect(calls[1]?.method).toBe("PUT");
  });

  it("throws when the presign step fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    await expect(uploadPhoto("http://localhost:3001", "dsr-1", fakeFile())).rejects.toThrow();
  });

  it("throws when the direct-to-R2 PUT fails, without confirming", async () => {
    global.fetch = vi.fn((url: string) => {
      if (String(url).endsWith("/photos/presign")) {
        return Promise.resolve({ ok: true, json: async () => ({ uploadUrl: "https://r2.example/put", storageKey: "k" }) });
      }
      return Promise.resolve({ ok: false });
    }) as unknown as typeof fetch;

    await expect(uploadPhoto("http://localhost:3001", "dsr-1", fakeFile())).rejects.toThrow();
  });
});
