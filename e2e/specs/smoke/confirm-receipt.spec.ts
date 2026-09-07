import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { MATERIAL_NAME, SITE_NAME, VENDOR_NAME } from "../../fixtures/test-users";
import { pickCombobox } from "../../fixtures/ui";

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
  await page.getByLabel(/Quantity/).fill("100");
  await page.getByLabel("Rate").fill("100");
  await page.getByRole("button", { name: "Record Purchase" }).click();
  await expect(page.getByText("Purchase recorded")).toBeVisible({ timeout: 10_000 });

  await page.goto("/movements/godown-to-site/new");
  await pickCombobox(page, "Material / Size", MATERIAL_NAME);
  await pickCombobox(page, "Destination Site", SITE_NAME);
  await page.getByLabel(/Sent Quantity/).fill("10");
  await page.getByRole("button", { name: "Record Movement" }).click();
  await expect(page.getByText("Movement recorded")).toBeVisible({ timeout: 10_000 });

  await expect(page.getByText("Pending receipt").first()).toBeVisible();
  await page.getByRole("link", { name: "Confirm Receipt" }).first().click();

  await expect(page.getByRole("heading", { name: "Confirm Receipt" })).toBeVisible();
  await page.getByLabel("Received Quantity").fill("10");
  await page.getByRole("button", { name: "Confirm Receipt" }).click();

  // The redirect lands on /movements?flash=... but flash-toast.tsx's own
  // effect strips the query param via router.replace() right after
  // reading it — asserting the URL still carries ?flash= races that
  // cleanup and only "worked" when the app was slow enough to lose it.
  // The toast text below is the real, stable proof.
  await expect(page).toHaveURL(/\/movements/);
  await expect(page.getByText("Receipt confirmed")).toBeVisible({ timeout: 10_000 });
});
