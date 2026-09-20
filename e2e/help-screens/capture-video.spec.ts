import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { loginAsOwner, loginAsSupervisor } from "../fixtures/auth";
import { CAPTURE_PLANS, type CaptureRole } from "./capture-plan";

// ONE-OFF PREVIEW SCRIPT — not part of the committed Help & Guides pipeline.
// Records a single guide's walkthrough as a real screen-recording video
// (Playwright's native context video), reusing the same capture-plan steps
// as the screenshot pipeline, so the guide's owner can preview what an
// automated per-guide video would look like before deciding whether to
// build this out for real. Not wired into any pnpm script.

const REPO_ROOT = path.resolve(__dirname, "../..");
const OUTPUT_DIR = process.env.HELP_VIDEO_OUTPUT_DIR ?? path.join(REPO_ROOT, "e2e/help-screens/.video-preview-tmp");
const GUIDE_ID = process.env.HELP_VIDEO_GUIDE_ID ?? "create-site";
const VIEWPORT = { width: 1280, height: 800 };
const STEP_PAUSE_MS = 900;
const TYPE_DELAY_MS = 45;

// Sample data typed into each guide's fields, so the video shows a real
// filled-in form instead of an empty one with just a ring moving around.
// Keyed by the step's targetDescription from capture-plan.ts. Only
// create-site is filled in for this preview; other guides fall back to
// highlight-only (no crash, just no typing).
const SAMPLE_DATA: Record<string, Record<string, { type: "fill" | "select"; value: string }>> = {
  "create-site": {
    'field "Name"': { type: "fill", value: "Riverside Residency - Phase 2" },
    'field "Location"': { type: "fill", value: "Nashik, Maharashtra" },
    'select "Status"': { type: "select", value: "ACTIVE" },
    'field "Contract reference"': { type: "fill", value: "REF/2026/014" },
    'field "Description"': { type: "fill", value: "3-tower residential project - phase 2 civil work." },
  },
};

async function highlight(page: import("@playwright/test").Page, target: import("@playwright/test").Locator) {
  const box = await target.boundingBox();
  if (!box) return;
  await page.evaluate((rect) => {
    document.querySelectorAll("[data-video-preview-ring]").forEach((el) => el.remove());
    const ring = document.createElement("div");
    ring.setAttribute("data-video-preview-ring", "true");
    Object.assign(ring.style, {
      position: "fixed",
      left: `${rect.x - 4}px`,
      top: `${rect.y - 4}px`,
      width: `${rect.width + 8}px`,
      height: `${rect.height + 8}px`,
      border: "3px solid #0f766e",
      borderRadius: "8px",
      boxShadow: "0 0 0 3px rgba(15,118,110,0.25)",
      pointerEvents: "none",
      zIndex: "999999",
      transition: "all 200ms ease",
    });
    document.body.appendChild(ring);
  }, box);
}

test("record a preview walkthrough video for one guide", async ({ browser }) => {
  const plan = CAPTURE_PLANS.find((p) => p.guideId === GUIDE_ID);
  if (!plan) throw new Error(`no capture plan for guide "${GUIDE_ID}"`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUTPUT_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();

  const role: CaptureRole = plan.role ?? "owner";
  if (role === "supervisor") {
    await loginAsSupervisor(page);
  } else {
    await loginAsOwner(page);
  }
  await page.waitForTimeout(STEP_PAUSE_MS);

  const sampleData = SAMPLE_DATA[GUIDE_ID] ?? {};
  let currentPath: string | null = null;

  for (const step of plan.steps) {
    if (!step) continue;

    // Skip re-navigating when the step is on the page we're already on —
    // re-running page.goto() to the same URL still triggers a full
    // reload/hydration flash in Next dev mode, which read as "flickering"
    // between steps that are really just different fields on one form.
    if (typeof step.goto === "string") {
      if (step.goto !== currentPath) {
        await page.goto(step.goto);
        await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
        currentPath = step.goto;
      }
    } else {
      await step.goto(page, "desktop");
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      currentPath = new URL(page.url()).pathname;
    }
    if (step.prepare) {
      await step.prepare(page, "desktop");
    }

    const target = step.target(page).filter({ visible: true }).first();
    await target.waitFor({ state: "visible", timeout: 15_000 });
    await target.evaluate((el) => el.scrollIntoView({ block: "center", inline: "nearest" }));
    await highlight(page, target);
    await page.waitForTimeout(400);

    const fill = sampleData[step.targetDescription];
    const tagName = await target.evaluate((el) => el.tagName);
    if (fill?.type === "select") {
      await target.selectOption(fill.value);
    } else if (fill?.type === "fill" && (tagName === "INPUT" || tagName === "TEXTAREA")) {
      await target.click();
      await target.pressSequentially(fill.value, { delay: TYPE_DELAY_MS });
    } else if (tagName === "BUTTON" && step.targetDescription.includes("Create Site")) {
      await target.click();
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      currentPath = new URL(page.url()).pathname;
      // Linger on the result screen (site list/detail after a real submit)
      // instead of cutting the video right as the redirect lands.
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(STEP_PAUSE_MS);
  }

  await page.evaluate(() => document.querySelectorAll("[data-video-preview-ring]").forEach((el) => el.remove()));
  await page.waitForTimeout(600);

  const video = page.video();
  await context.close();
  const videoPath = await video?.path();

  if (videoPath) {
    const finalPath = path.join(OUTPUT_DIR, `${GUIDE_ID}.webm`);
    fs.renameSync(videoPath, finalPath);
    console.log(`[help-video-preview] wrote ${finalPath}`);
  }
});
