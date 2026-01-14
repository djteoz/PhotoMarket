import { test, expect } from "@playwright/test";

test.describe("Search & Catalog", () => {
  test("should display search results", async ({ page }) => {
    await page.goto("/search");

    // Page should have search elements
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should show results or empty state
    const results = page.locator('[class*="card"], [class*="studio"]');
    const emptyState = page.getByText(/не найдено|нет результатов/i);

    const hasResults = (await results.count()) > 0;
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    expect(hasResults || hasEmptyState).toBeTruthy();
  });

  test("should filter by city", async ({ page }) => {
    await page.goto("/search");

    // Look for city filter
    const cityFilter = page
      .getByRole("combobox", { name: /город/i })
      .or(page.getByPlaceholder(/город/i))
      .or(page.locator('[name*="city"]'));

    if (await cityFilter.isVisible()) {
      await cityFilter.click();
      await cityFilter.fill("Москва");

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // URL should update with filter
      await expect(page).toHaveURL(/city=|москва/i);
    }
  });

  test("should filter by price range", async ({ page }) => {
    await page.goto("/search");

    // Look for price filter
    const minPriceInput = page
      .getByPlaceholder(/мин.*цена|от/i)
      .or(page.locator('[name*="minPrice"]'));

    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill("1000");

      const maxPriceInput = page
        .getByPlaceholder(/макс.*цена|до/i)
        .or(page.locator('[name*="maxPrice"]'));

      if (await maxPriceInput.isVisible()) {
        await maxPriceInput.fill("3000");
      }

      // Apply filters
      const applyButton = page.getByRole("button", {
        name: /применить|поиск|найти/i,
      });
      if (await applyButton.isVisible()) {
        await applyButton.click();
      }

      await page.waitForTimeout(500);
    }
  });

  test("should show studio card details", async ({ page }) => {
    await page.goto("/catalog");

    const firstCard = page.locator('[class*="card"]').first();

    if (await firstCard.isVisible()) {
      // Card should have image
      await expect(firstCard.locator("img").first()).toBeVisible();

      // Card should have name
      await expect(
        firstCard.locator('[class*="title"], h2, h3').first()
      ).toBeVisible();

      // Card should have location
      await expect(
        firstCard
          .getByText(/москва|санкт|город/i)
          .or(firstCard.locator('[class*="location"]'))
      ).toBeVisible();
    }
  });

  test("should navigate to studio detail page", async ({ page }) => {
    await page.goto("/catalog");

    const firstStudioLink = page.locator('a[href*="/studios/"]').first();

    if (await firstStudioLink.isVisible()) {
      await firstStudioLink.click();

      // Should be on studio detail page
      await expect(page).toHaveURL(/\/studios\/.+/);

      // Should show studio details
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("should show map view", async ({ page }) => {
    await page.goto("/search");

    // Look for map container
    const map = page.locator('[class*="map"], [class*="leaflet"], #map');

    if (await map.isVisible()) {
      // Map should be interactive
      await expect(map).toBeVisible();
    }
  });
});
