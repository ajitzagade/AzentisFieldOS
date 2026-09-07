import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { visibleText } from "../../fixtures/ui";

test("Owner can add a Vendor and it appears in the list", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/vendors/new");

  const name = `E2E Smoke Vendor ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create Vendor" }).click();

  await expect(page).toHaveURL(/\/vendors$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});

// Vendor & Subcontractor detail side panel: a plain row click opens the
// summary in place (URL gains ?vendorId=, no navigation away from the
// list) instead of the old hard-navigate-to-/vendors/[id] behavior.
test("clicking a Vendor row opens the detail panel in place, and Escape closes it", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/vendors/new");

  const name = `E2E Panel Vendor ${Date.now()}`;
  // .first(): a known upstream Base UI bug (see f665717) can leave an
  // orphaned duplicate form field in the DOM right after a dialog-close +
  // navigation sequence — the preceding spec's panel "View full details"
  // click is exactly that pattern.
  await page.getByLabel("Name").first().fill(name);
  await page.getByLabel("Contact person").first().fill("Ravi Kumar");
  await page.getByRole("button", { name: "Create Vendor" }).click();
  await expect(page).toHaveURL(/\/vendors$/);
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });

  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — .first() avoids a
  // strict-mode ambiguity on the row link.
  await page.getByRole("link", { name }).first().click();

  // No navigation away from the list — the panel opens in place.
  await expect(page).toHaveURL(new RegExp(`/vendors\\?vendorId=`));
  // The "Vendor added" success toast is also role="dialog" (Base UI's
  // Toast.Root) and can still be visible at this point — scope to the
  // panel's own title (the fetched Vendor's name) to avoid a strict-mode
  // ambiguity between the two.
  const dialog = page.getByRole("dialog", { name });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Ravi Kumar")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/\/vendors$/);
});
