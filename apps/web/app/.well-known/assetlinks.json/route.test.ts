import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ANDROID_PACKAGE_ID/ANDROID_SHA256_FINGERPRINT are read once, at module
// import time, from lib/tenant.ts. Mock that module per test (via
// vi.doMock + vi.resetModules + a dynamic re-import of the route) to
// exercise both I/O matrix branches, rather than mutating process.env
// after lib/tenant's top-level `||` fallback has already evaluated.
describe(".well-known/assetlinks.json route handler", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns 200 with [] when both env-derived constants are unset (unconfigured deployment)", async () => {
    vi.doMock("../../../lib/tenant", () => ({
      ANDROID_PACKAGE_ID: "",
      ANDROID_SHA256_FINGERPRINT: "",
    }));

    const { GET } = await import("./route");
    const res = GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });

  it("returns one Digital Asset Links statement when both constants are configured", async () => {
    vi.doMock("../../../lib/tenant", () => ({
      ANDROID_PACKAGE_ID: "in.azentis.sandeep-enterprises",
      ANDROID_SHA256_FINGERPRINT: "14:6D:E9:AB:CD:EF",
    }));

    const { GET } = await import("./route");
    const res = GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "in.azentis.sandeep-enterprises",
          sha256_cert_fingerprints: ["14:6D:E9:AB:CD:EF"],
        },
      },
    ]);
  });

  it("treats a partially-configured deployment (only one var set) as unconfigured", async () => {
    vi.doMock("../../../lib/tenant", () => ({
      ANDROID_PACKAGE_ID: "in.azentis.sandeep-enterprises",
      ANDROID_SHA256_FINGERPRINT: "",
    }));

    const { GET } = await import("./route");
    const res = GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([]);
  });

  // The tests above mock lib/tenant.ts entirely, so lib/tenant.ts's own
  // `process.env.X?.trim() || ""` logic never actually runs in any test in
  // this repo — a regression there (e.g. `.trim()` dropped, or `||` swapped
  // for `??`, which wouldn't catch an explicitly-empty-string env var) would
  // ship undetected. These exercise the real module: set process.env, make
  // sure no previous vi.doMock registration for lib/tenant leaks in, and
  // dynamically import route.ts (which imports the real lib/tenant.ts).
  describe("against the real lib/tenant.ts module (no mocking)", () => {
    beforeEach(() => {
      // vi.unmock is hoisted to the top of the file (like vi.mock), which
      // would run before the other tests' vi.doMock calls and do nothing.
      // vi.doUnmock is the non-hoisted counterpart (like vi.doMock) — it
      // actually undoes the mock registration at this point in execution.
      vi.doUnmock("../../../lib/tenant");
    });

    afterEach(() => {
      delete process.env.ANDROID_PACKAGE_ID;
      delete process.env.ANDROID_SHA256_FINGERPRINT;
    });

    it("trims whitespace-padded env vars and still emits a matching statement", async () => {
      process.env.ANDROID_PACKAGE_ID = "  in.azentis.sandeep-enterprises  \n";
      process.env.ANDROID_SHA256_FINGERPRINT = "\t14:6D:E9:AB:CD:EF ";

      const { GET } = await import("./route");
      const res = GET();

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: "in.azentis.sandeep-enterprises",
            sha256_cert_fingerprints: ["14:6D:E9:AB:CD:EF"],
          },
        },
      ]);
    });

    it("falls back to [] when both env vars are unset", async () => {
      delete process.env.ANDROID_PACKAGE_ID;
      delete process.env.ANDROID_SHA256_FINGERPRINT;

      const { GET } = await import("./route");
      const res = GET();

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([]);
    });

    it("treats a whitespace-only env var as unset (falls back to [])", async () => {
      process.env.ANDROID_PACKAGE_ID = "   ";
      process.env.ANDROID_SHA256_FINGERPRINT = "14:6D:E9:AB:CD:EF";

      const { GET } = await import("./route");
      const res = GET();

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([]);
    });
  });
});
