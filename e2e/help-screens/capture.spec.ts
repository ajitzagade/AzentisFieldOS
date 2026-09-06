import fs from "node:fs";
import path from "node:path";
import { test, type Locator, type Page } from "@playwright/test";
import { HELP_CONTENT } from "../../packages/shared/src/content/help-content";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { CAPTURE_PLANS, type CaptureRole, type CaptureViewport, type StepCapturePlan } from "./capture-plan";

// Drives the real app (same seeded e2e DB + servers as the main suite) to
// every guide step's screen at a mobile and a desktop viewport, screenshots
// the viewport, and records the target element's bounding box. Outputs are
// committed artifacts:
//   apps/web/public/help-screens/{guideId}/{index}.{viewport}.png
//   apps/web/lib/help-screens.manifest.json
// Regenerate with `pnpm help:screens` — never hand-edit either output.
//
// Failure contract (spec I/O matrix): a step whose selector matches nothing
// fails loudly naming guide/step/selector and gets NO image and NO manifest
// entry (a step needs both viewports to be published); the run exits
// non-zero. Steps that captured cleanly are still written, so a re-run
// after a fix converges instead of starting over.

const REPO_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_IMAGE_ROOT = path.join(REPO_ROOT, "apps/web/public/help-screens");
const MANIFEST_PATH = path.join(REPO_ROOT, "apps/web/lib/help-screens.manifest.json");

// deviceScaleFactor 1 everywhere: manifest rects are in CSS px and the PNG
// pixel grid must match them 1:1.
const VIEWPORTS: Record<CaptureViewport, { width: number; height: number }> = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
};
const VIEWPORT_ORDER: CaptureViewport[] = ["mobile", "desktop"];

interface CaptureRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CapturedShot {
  png: Buffer;
  rect: CaptureRect;
  imageW: number;
  imageH: number;
}

// Next dev renders its dev-tools indicator into a <nextjs-portal> element —
// purely a dev-server artifact that must never appear in a committed
// product screenshot. (The capture run reuses the e2e harness's `next dev`
// webServer; a production `next start` has no such portal.)
async function hideDevPortal(page: Page) {
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
}

// Dev-mode hydration can leave a unique element transiently matching twice
// (observed on the first capture run: strict-mode violations on selectors
// that resolve to exactly one element in steady state). Ring targets are
// therefore (a) filtered to visible elements and (b) required to settle to
// EXACTLY one visible match — a persistent 2+ still fails loudly (genuine
// ambiguity must be fixed in the plan, never papered over with .first()).
async function waitForSingleVisibleMatch(target: Locator, description: string) {
  const deadline = Date.now() + 15_000;
  let count = -1;
  while (Date.now() < deadline) {
    count = await target.count();
    if (count === 1) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`expected exactly 1 visible match for ${description}, found ${count}`);
}

async function captureStep(page: Page, viewport: CaptureViewport, step: StepCapturePlan): Promise<CapturedShot> {
  if (typeof step.goto === "string") {
    await page.goto(step.goto);
  } else {
    await step.goto(page, viewport);
  }
  // Let hydration/data-fetching settle before touching the page (Turbopack's
  // HMR websocket doesn't count toward networkidle). Best-effort only — a
  // page with background polling must not hang the capture.
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await hideDevPortal(page);
  if (step.prepare) {
    await step.prepare(page, viewport);
  }

  const target = step.target(page).filter({ visible: true });
  await waitForSingleVisibleMatch(target, step.targetDescription);
  await target.waitFor({ state: "visible", timeout: 15_000 });
  // Center the target so it can't sit under a fixed quick-bar / header edge.
  await target.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
  // Web fonts change glyph metrics — settle them before measuring/shooting.
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const box = await target.boundingBox();
  if (!box) {
    throw new Error("target resolved but has no bounding box (zero-size or detached)");
  }

  const png = await page.screenshot({ animations: "disabled", caret: "hide" });
  const size = page.viewportSize();
  if (!size) throw new Error("page has no viewport size");
  return {
    png,
    // Rounded to whole CSS px — keeps the manifest byte-stable across runs
    // (sub-pixel layout jitter would otherwise churn every rect).
    rect: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) },
    imageW: size.width,
    imageH: size.height,
  };
}

test("capture annotated screenshots for every Help & Guides step", async ({ browser }) => {
  assertPlanMatchesContent();

  // guideId → stepIndex → viewport → shot, filled viewport-by-viewport.
  const shots = new Map<string, Map<number, Partial<Record<CaptureViewport, CapturedShot>>>>();
  const failures: string[] = [];

  // Grouped by role within each viewport: one context + one sign-in per
  // role (most guides capture as the seeded Owner; submit-dsr captures as
  // the seeded Supervisor — see the plan's role note).
  const ROLE_ORDER: CaptureRole[] = ["owner", "supervisor"];
  for (const viewport of VIEWPORT_ORDER) {
    for (const role of ROLE_ORDER) {
      const plans = CAPTURE_PLANS.filter((plan) => (plan.role ?? "owner") === role);
      if (plans.length === 0) continue;

      const context = await browser.newContext({ viewport: VIEWPORTS[viewport], deviceScaleFactor: 1 });
      const page = await context.newPage();
      if (role === "supervisor") {
        await loginAsSupervisor(page);
      } else {
        await loginAsOwner(page);
      }

      for (const plan of plans) {
        for (let index = 0; index < plan.steps.length; index++) {
          const step = plan.steps[index];
          if (!step) continue; // deliberate text-only step — see plan comment
          try {
            const shot = await captureStep(page, viewport, step);
            let guideShots = shots.get(plan.guideId);
            if (!guideShots) shots.set(plan.guideId, (guideShots = new Map()));
            const stepShots = guideShots.get(index) ?? {};
            stepShots[viewport] = shot;
            guideShots.set(index, stepShots);
          } catch (error) {
            failures.push(
              `${plan.guideId} step ${index + 1}/${plan.steps.length} [${viewport}] — target ${step.targetDescription}: ${
                error instanceof Error ? error.message.split("\n")[0] : String(error)
              }`,
            );
          }
        }
      }

      await context.close();
    }
  }

  writeOutputs(shots, failures);

  if (failures.length > 0) {
    throw new Error(`help-screens capture failed for ${failures.length} step-shot(s):\n  - ${failures.join("\n  - ")}`);
  }
});

function assertPlanMatchesContent() {
  const guides = HELP_CONTENT.guides;
  const planIds = CAPTURE_PLANS.map((p) => p.guideId);
  const contentIds = guides.map((g) => g.id);
  if (JSON.stringify(planIds) !== JSON.stringify(contentIds)) {
    throw new Error(
      `capture-plan guides [${planIds.join(", ")}] do not match HELP_CONTENT.guides [${contentIds.join(", ")}]`,
    );
  }
  for (const plan of CAPTURE_PLANS) {
    const guide = guides.find((g) => g.id === plan.guideId);
    if (guide && guide.steps.length !== plan.steps.length) {
      throw new Error(
        `capture-plan for "${plan.guideId}" has ${plan.steps.length} steps but HELP_CONTENT has ${guide.steps.length} — update e2e/help-screens/capture-plan.ts to match the guide content`,
      );
    }
  }
}

function writeOutputs(
  shots: Map<string, Map<number, Partial<Record<CaptureViewport, CapturedShot>>>>,
  failures: string[],
) {
  // Full clean before writing: removed/renamed steps must not leave stale
  // PNGs behind, and the manifest is rebuilt from scratch every run.
  fs.rmSync(OUTPUT_IMAGE_ROOT, { recursive: true, force: true });

  // Insertion order is deliberate and deterministic (guide order from the
  // plan, numeric step order, mobile before desktop) so the committed
  // manifest is byte-stable across runs.
  const manifest: Record<string, Record<string, Record<string, unknown>>> = {};

  for (const plan of CAPTURE_PLANS) {
    const guideShots = shots.get(plan.guideId);
    if (!guideShots) continue;
    const guide = HELP_CONTENT.guides.find((g) => g.id === plan.guideId);
    for (const index of [...guideShots.keys()].sort((a, b) => a - b)) {
      const stepShots = guideShots.get(index);
      if (!stepShots?.mobile || !stepShots.desktop) {
        // One viewport failed — publish nothing for the step ("no partial
        // entry"); the failure list already names it.
        continue;
      }
      const entry: Record<string, unknown> = {
        // The manifest is keyed by positional index, but guide.steps can be
        // reordered/edited independently in help-content.ts — stamping the
        // title this run was captured against lets a lightweight pnpm-test
        // check (help-screens-manifest.test.ts) catch drift immediately
        // instead of silently pairing a stale screenshot with a new caption.
        stepTitle: guide?.steps[index]?.title,
      };
      for (const viewport of VIEWPORT_ORDER) {
        const shot = stepShots[viewport];
        if (!shot) continue;
        const relImage = `${plan.guideId}/${index}.${viewport}.png`;
        const filePath = path.join(OUTPUT_IMAGE_ROOT, relImage);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, shot.png);
        entry[viewport] = {
          image: `/help-screens/${relImage}`,
          imageW: shot.imageW,
          imageH: shot.imageH,
          target: shot.rect,
        };
      }
      (manifest[plan.guideId] ??= {})[String(index)] = entry;
    }
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  const stepCount = Object.values(manifest).reduce((n, g) => n + Object.keys(g).length, 0);
  console.log(
    `[help-screens] wrote ${stepCount} annotated step captures (${failures.length} failed) → ${path.relative(REPO_ROOT, OUTPUT_IMAGE_ROOT)} + ${path.relative(REPO_ROOT, MANIFEST_PATH)}`,
  );
}
