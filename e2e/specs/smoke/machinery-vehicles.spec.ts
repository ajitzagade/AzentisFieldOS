import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";
import { visibleText } from "../../fixtures/ui";

test("Owner can register a Machine and it appears in the register", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/machinery-vehicles/machinery/new");

  const name = `E2E Smoke Excavator ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Type").selectOption({ label: "Excavator" });
  await page.getByLabel("Asset / Registration Number").fill(`REG-${Date.now()}`);
  await page.getByRole("button", { name: "Register Machine" }).click();

  await expect(page).toHaveURL(/\/machinery-vehicles$/);
  // DataTable's mobileCard mode renders both a desktop and mobile copy of
  // every row simultaneously (one CSS-hidden) — plain getByText() matches
  // both and throws a strict-mode ambiguity error.
  await expect(visibleText(page, name)).toBeVisible({ timeout: 10_000 });
});

// Machinery and Vehicles are two distinct registers sharing this one
// module — the Machine test above doesn't exercise the Vehicle form at all.
test("Owner can register a Vehicle and it appears in the register", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/machinery-vehicles/vehicles/new");

  const number = `E2E-${Date.now()}`;
  await page.getByLabel("Number").fill(number);
  await page.getByLabel("Type").selectOption({ label: "Truck" });
  await page.getByRole("button", { name: "Register Vehicle" }).click();

  await expect(page).toHaveURL(/\/machinery-vehicles$/);
  await expect(visibleText(page, number)).toBeVisible({ timeout: 10_000 });
});
