import { expect, test } from "@playwright/test";

/**
 * Smoke tests: no auth, no external APIs — only that the app serves pages.
 * Add flow tests (sign-in → workspace) in separate files with test credentials or route mocking.
 */

const defaultLocalePrefix = "/fr";

test.describe("public pages", () => {
  test("home renders", async ({ page }) => {
    await page.goto(`${defaultLocalePrefix}`);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("sign-in page renders", async ({ page }) => {
    await page.goto(`${defaultLocalePrefix}/auth/signin`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
