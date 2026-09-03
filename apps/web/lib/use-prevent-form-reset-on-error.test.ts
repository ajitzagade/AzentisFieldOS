import { describe, expect, it } from "vitest";
import { usePreventFormResetOnError as reExported } from "./use-prevent-form-reset-on-error";
import { usePreventFormResetOnError as canonical } from "@azentisfieldos/ui";

// This file just re-exports packages/ui's hook (see the file's own comment
// for why) — the actual behavior is tested once, at the canonical source
// (packages/ui/src/lib/use-prevent-form-reset-on-error.test.ts). Re-testing
// the same logic here would drift out of sync with that suite over time
// (already happened once); this only pins that the re-export is live.
describe("use-prevent-form-reset-on-error re-export", () => {
  it("re-exports the exact same function as @azentisfieldos/ui", () => {
    expect(reExported).toBe(canonical);
  });
});
