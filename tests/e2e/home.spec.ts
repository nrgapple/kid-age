import { expect, test } from "@playwright/test";

test("renders the first-run home state", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Build a time map for your family")).toBeVisible();
  await expect(page.getByText("Add a child")).toBeVisible();
  await expect(page.getByText("Compare")).toBeVisible();
});
