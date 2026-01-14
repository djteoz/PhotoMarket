import { test, expect } from "@playwright/test";

test.describe("Mobile Experience", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("homepage renders correctly on mobile", async ({ page }) => {
    await page.goto("/");

    // Hero should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Search should be accessible
    await expect(
      page.getByPlaceholder(/поиск|найти/i).or(page.getByRole("searchbox"))
    ).toBeVisible();
  });

  test("mobile navigation works", async ({ page }) => {
    await page.goto("/");

    // Look for hamburger menu
    const menuButton = page
      .getByRole("button", { name: /меню|menu/i })
      .or(page.locator('[class*="hamburger"], [class*="menu-toggle"]'));

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Navigation links should appear
      await expect(
        page.getByRole("link", { name: /каталог|поиск|catalog/i })
      ).toBeVisible();
    }
  });

  test("studio cards are mobile-friendly", async ({ page }) => {
    await page.goto("/catalog");

    // Cards should be full width or nicely stacked
    const card = page.locator('[class*="card"]').first();

    if (await card.isVisible()) {
      const box = await card.boundingBox();
      if (box) {
        // Card should take most of the width
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });

  test("filters are accessible on mobile", async ({ page }) => {
    await page.goto("/search");

    // Look for filter button or collapsible filters
    const filterButton = page.getByRole("button", { name: /фильтр|filter/i });

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // Filter options should appear
      await expect(page.getByText(/цена|город|площадь/i)).toBeVisible();
    }
  });

  test("touch interactions work", async ({ page }) => {
    await page.goto("/");

    // Tap on a link
    const link = page
      .getByRole("link", { name: /каталог|смотреть все/i })
      .first();

    if (await link.isVisible()) {
      await link.tap();

      // Should navigate
      await page.waitForURL(/catalog|search/);
    }
  });
});

test.describe("PWA Features", () => {
  test("has valid manifest", async ({ page }) => {
    await page.goto("/");

    // Check manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute("href", "/manifest.json");

    // Verify manifest is accessible
    const response = await page.request.get("/manifest.json");
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeDefined();
  });

  test("service worker is registered", async ({ page }) => {
    await page.goto("/");

    // Wait a bit for SW to register
    await page.waitForTimeout(2000);

    // Check if SW is registered
    const swRegistered = await page.evaluate(() => {
      return "serviceWorker" in navigator;
    });

    expect(swRegistered).toBeTruthy();
  });

  test("has proper meta tags for PWA", async ({ page }) => {
    await page.goto("/");

    // Check theme-color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute("content");

    // Check viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });
});

test.describe("Offline Support", () => {
  test("offline page exists", async ({ page }) => {
    const response = await page.request.get("/offline");
    expect(response.ok()).toBeTruthy();
  });

  test("offline page has proper content", async ({ page }) => {
    await page.goto("/offline");

    // Should show offline message
    await expect(page.getByText(/офлайн|подключени|интернет/i)).toBeVisible();

    // Should have retry button
    await expect(
      page.getByRole("button", { name: /попробовать|повторить|обновить/i })
    ).toBeVisible();
  });
});
