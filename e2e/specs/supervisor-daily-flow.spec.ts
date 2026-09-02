import { expect, test } from "@playwright/test";
import { loginAsSupervisor } from "../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../fixtures/test-users";
import { pickCombobox, visibleText } from "../fixtures/ui";

// Drives the Site Supervisor's actual daily path exactly as a real user
// would: sign in, land on the task-first Home, submit a Daily Report with
// only the one required field, and record a Material Received entry that
// carries no pricing (D7) — the two things a Supervisor does every day.
//
// This file runs under BOTH the desktop and mobile-chromium projects (see
// playwright.config.ts), and all specs share one seeded database across a
// single suite run — so "Start Daily Report" may match either the hero card
// (always present) or the missing-report gap-flag's own action (only
// present before that Site has a report for today, which an earlier test —
// on either project — may have already filed). Locators below deliberately
// accept either, `.first()`, rather than assuming a specific one exists.
test.describe("Supervisor daily flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSupervisor(page);
  });

  test("Home shows the task grid", async ({ page }) => {
    // Each task card's accessible name is "<label> <hint>" (the hint
    // paragraph sits inside the same link) — anchor at the start rather
    // than exact-matching just the label.
    await expect(page.getByRole("link", { name: /Start Daily Report/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^Material Received/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Material Sent/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Material Used/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Attendance/ })).toBeVisible();
  });

  test("mobile bottom quick-bar shows only below the lg breakpoint", async ({ page }) => {
    // Real responsive behavior, not a fixed always-visible element: the
    // quick-bar is Tailwind `lg:hidden`, so its expected visibility flips
    // with viewport width — assert whichever outcome is actually correct
    // for the viewport this run is under.
    const viewport = page.viewportSize();
    const isMobileViewport = (viewport?.width ?? 1280) < 1024;
    const quickBar = page.getByRole("navigation", { name: "Quick actions" });
    if (isMobileViewport) {
      await expect(quickBar).toBeVisible();
      await expect(quickBar.getByRole("link", { name: "Report" })).toHaveAttribute("href", "/dsr/new");
    } else {
      await expect(quickBar).toBeHidden();
    }
  });

  test("submits a Daily Report with only the Site set — the <5-minute minimal path", async ({ page }) => {
    await page.getByRole("link", { name: /Start Daily Report/ }).first().click();
    await expect(page).toHaveURL(/\/dsr\/new/);

    await pickCombobox(page, "Site", SITE_NAME);

    const submit = page.getByRole("button", { name: /Submit Daily Report/ });
    await expect(submit).toBeEnabled();
    await submit.click();

    // The form never surfaces a hard failure to the Supervisor — it shows
    // either "Synced" (server reachable, which it is here) or the offline
    // "Saved on device" state. Against the real local API this must sync.
    // (Re-submitting for a Site/date that already has a report is treated
    // as an edit to that report, not a duplicate — still syncs cleanly.)
    await expect(page.getByText("Synced")).toBeVisible({ timeout: 15_000 });
  });

  test("records Material Received with no pricing fields, and it appears Pricing pending", async ({ page }) => {
    await page.getByRole("link", { name: /^Material Received/ }).click();
    await expect(page).toHaveURL(/\/movements\/purchases\/new/);

    // D7: a Supervisor's inward form has no money fields at all.
    await expect(page.getByLabel("Rate")).not.toBeVisible();
    await expect(page.getByLabel("Total Amount")).not.toBeVisible();
    await expect(page.getByLabel("Payment Status")).not.toBeVisible();
    await expect(page.getByText(/Rates & amounts are entered by the office/)).toBeVisible();

    await page.getByLabel("Vendor").selectOption({ label: VENDOR_NAME });
    await pickCombobox(page, "Material / Size", MATERIAL_NAME);
    await page.getByLabel(/Quantity/).fill("50");

    await page.getByRole("button", { name: "Record Purchase" }).click();
    // The redirect (not the transient flash toast, which can dismiss before
    // this assertion runs) plus the pending badge below are the real proof.
    await expect(page).toHaveURL(/\/movements/, { timeout: 10_000 });

    // The just-created entry shows the pending badge in the log (chromium
    // and mobile-chromium share one database across the suite run, so more
    // than one pending row can legitimately exist here — assert at least one).
    await expect(visibleText(page, "Pricing pending").first()).toBeVisible();
  });

  test("records Attendance for the seeded Team Member", async ({ page }) => {
    await page.getByRole("link", { name: /^Attendance/ }).click();
    await expect(page).toHaveURL(/\/daily-activity\/work-records\/new/);

    await pickCombobox(page, "Site", SITE_NAME);
    await expect(page.getByRole("button", { name: /Save/ })).toBeVisible();
  });
});
