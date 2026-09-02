import { expect, test } from "@playwright/test";
import { loginAsOwner } from "../../fixtures/auth";

test("Owner can register a Machine and it appears in the register", async ({ page }) => {
  await loginAsOwner(page);
  await page.goto("/machinery-vehicles/machinery/new");

  const name = `E2E Smoke Excavator ${Date.now()}`;
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Type").selectOption({ label: "Excavator" });
  await page.getByLabel("Asset / Registration Number").fill(`REG-${Date.now()}`);
  await page.getByRole("button", { name: "Register Machine" }).click();

  await expect(page).toHaveURL(/\/machinery-vehicles$/);
  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 });
});
