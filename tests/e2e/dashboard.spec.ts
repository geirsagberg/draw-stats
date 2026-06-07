import { expect, test } from "@playwright/test";

test("renders the demo dashboard without configured services", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Draw Stats")).toBeVisible();
  await expect(page.getByText("Demo mode")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Launch board" })).toBeVisible();
  await expect(page.getByText("Card progress")).toBeVisible();
});
