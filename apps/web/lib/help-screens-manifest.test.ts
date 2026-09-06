import { describe, expect, it } from "vitest";
import { HELP_CONTENT } from "@azentisfieldos/shared";
import helpScreensManifest from "./help-screens.manifest.json";
import type { HelpScreensManifest } from "../app/(app)/help/_components/guide-step-screenshot";

// Guards against exactly the drift the guide page's own stepTitle check
// defends against at runtime: the manifest is keyed by positional step
// index, and help-content.ts's step arrays can be reordered/edited
// independently. The page already falls back to text-only on a mismatch
// (never shows a wrong screenshot), but a silent mismatch shipping
// unnoticed still means real annotated screenshots quietly stop
// appearing — this test fails loudly under the normal `pnpm test` path
// (no e2e/DB/Playwright needed) so drift gets caught and re-captured
// (`pnpm help:screens`) instead of discovered by a user seeing a
// guide with no screenshots.
const MANIFEST = helpScreensManifest as HelpScreensManifest;

describe("help-screens.manifest.json stays in sync with HELP_CONTENT", () => {
  it("has a stepTitle matching the live guide content for every published entry", () => {
    const mismatches: string[] = [];
    for (const [guideId, steps] of Object.entries(MANIFEST)) {
      const guide = HELP_CONTENT.guides.find((g) => g.id === guideId);
      if (!guide) {
        mismatches.push(`${guideId}: guide no longer exists in HELP_CONTENT`);
        continue;
      }
      for (const [indexStr, entry] of Object.entries(steps ?? {})) {
        const index = Number(indexStr);
        const liveTitle = guide.steps[index]?.title;
        if (liveTitle === undefined) {
          mismatches.push(`${guideId}[${index}]: manifest has an entry but HELP_CONTENT has no step at that index`);
        } else if (entry.stepTitle !== liveTitle) {
          mismatches.push(
            `${guideId}[${index}]: manifest was captured for "${entry.stepTitle}" but the live step is now "${liveTitle}"`,
          );
        }
      }
    }
    expect(
      mismatches,
      mismatches.length > 0
        ? `help-content.ts changed since the last capture — re-run \`pnpm help:screens\`:\n  ${mismatches.join("\n  ")}`
        : undefined,
    ).toEqual([]);
  });
});
