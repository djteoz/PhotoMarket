import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display hero section", async ({ page }) => {
    await page.goto("/");

    // Check main heading
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Найдите идеальную фотостудию"
    );

    // Check search form exists
    await expect(page.getByPlaceholder(/поиск|найти|студи/i)).toBeVisible();

    // Check CTA button
    await expect(
      page.getByRole("link", { name: /смотреть все|каталог/i })
    ).toBeVisible();
  });

  test("should display popular studios", async ({ page }) => {
    await page.goto("/");

    // Check popular section
    await expect(page.getByText("Популярные студии")).toBeVisible();

    // Check studio cards are rendered
    const studioCards = page
      .locator('[class*="card"]')
      .filter({ hasText: /залов|руб/i });
    await expect(studioCards.first()).toBeVisible();
  });

  test("should navigate to search page", async ({ page }) => {
    await page.goto("/");

    // Click search button or link
    await page.getByRole("link", { name: /смотреть все|каталог/i }).click();

    // Should be on search or catalog page
    await expect(page).toHaveURL(/\/search|\/catalog/);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Hero should still be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Mobile menu should be accessible
    const mobileMenuButton = page.getByRole("button", { name: /меню|menu/i });
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.getByRole("navigation")).toBeVisible();
    }
  });
});
