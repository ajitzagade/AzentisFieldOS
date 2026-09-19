import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { fillField, pickCombobox } from "../../fixtures/ui";

// AC #2: the receiving Site confirms what actually arrived — a separate,
// later step than the sent-side recording (Story 5.2). Every Movement
// (Godown-to-Site or Site-to-Site) starts pending confirmation; creating
// one never asks for a received quantity up front.
test("Owner can confirm receipt of a Godown-to-Site Movement", async ({ page }) => {
  await loginAsOwner(page);

  // Seed Godown Stock, then move some of it to the Site.
  await page.goto("/movements/purchases/new");
  await pickCombobox(page, "Vendor", VENDOR_NAME);
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await fillField(page, /Quantity/, "100");
  await fillField(page, "Rate", "100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/godown-to-site/new");
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await pickCombobox(page, "Destination Site", SITE_NAME);
  // Deliberately distinctive quantities (137 sent / 94 received) so the
  // post-confirmation assertion below can find THIS movement's row without
  // colliding with rows from other specs sharing the seeded DB.
  await fillField(page, /Sent Quantity/, "137");
  await page.getByRole("button", { name: "Record Movement" }).click();
  await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText("Pending receipt").first()).toBeVisible();
  // Scope the click to THIS movement's row (found via its distinctive sent
  // quantity) — a bare .first() can grab an older pending movement left
  // behind by another spec sharing the seeded DB.
  await page
    .locator("tr", { hasText: "137" })
    .first()
    .getByRole("link", { name: "Confirm Receipt" })
    .click();

  await expect(page.getByRole("heading", { name: "Confirm Receipt" })).toBeVisible();
  await fillField(page, "Received Quantity", "94");
  await page.getByRole("button", { name: "Confirm Receipt" }).click();

  // The redirect lands on /movements?flash=... but flash-toast.tsx's own
  // effect strips the query param via router.replace() right after
  // reading it — asserting the URL still carries ?flash= races that
  // cleanup and only "worked" when the app was slow enough to lose it.
  // The toast text below is the real, stable proof.
  await expect(page).toHaveURL(/\/movements/);
  await expect(page.getByText("Receipt confirmed")).toBeVisible({ timeout: 10_000 });

  // Post-state, not just the toast: this movement's row has flipped from the
  // "Pending receipt" badge to the received quantity (94 ≠ 137 sent renders
  // as a highlighted mismatch), proving the confirmation reflects in the
  // list immediately.
  const movementRow = page.locator("tr", { hasText: "137" }).first();
  await expect(movementRow).toContainText("94");
  await expect(movementRow).not.toContainText("Pending receipt");
});
