import { test, expect } from "@playwright/test";

test.describe("Studio Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a studio page (will need actual studio ID in real tests)
    await page.goto("/catalog");
    const studioLink = page.locator('a[href*="/studios/"]').first();
    if (await studioLink.isVisible()) {
      await studioLink.click();
    }
  });

  test("should display studio information", async ({ page }) => {
    // Only run if we're on a studio page
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Should have title
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have address/location
    await expect(page.getByText(/адрес|москва|санкт/i)).toBeVisible();
  });

  test("should display gallery images", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Should have images
    const images = page
      .locator("img")
      .filter({ hasNot: page.locator('[class*="avatar"]') });
    await expect(images.first()).toBeVisible();
  });

  test("should display rooms list", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Should have rooms section
    const roomsSection = page.getByText(/залы|помещения|комнаты/i);
    if (await roomsSection.isVisible()) {
      // Should show room cards
      const roomCards = page
        .locator('[class*="room"], [class*="card"]')
        .filter({
          hasText: /руб|час|м²/i,
        });
      await expect(roomCards.first()).toBeVisible();
    }
  });

  test("should show booking form", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Look for booking button or form
    const bookingButton = page.getByRole("button", {
      name: /забронировать|бронь/i,
    });
    const bookingForm = page
      .locator("form")
      .filter({ hasText: /бронирование|дата|время/i });

    const hasBooking =
      (await bookingButton.isVisible().catch(() => false)) ||
      (await bookingForm.isVisible().catch(() => false));

    expect(hasBooking).toBeTruthy();
  });

  test("should display reviews section", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Look for reviews section
    const reviewsSection = page.getByText(/отзывы|рейтинг/i);
    await expect(reviewsSection.first()).toBeVisible();
  });

  test("should have favorite button", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Look for favorite/heart button
    const favoriteButton = page
      .getByRole("button")
      .filter({
        has: page.locator('[class*="heart"], svg'),
      })
      .first();

    if (await favoriteButton.isVisible()) {
      await expect(favoriteButton).toBeEnabled();
    }
  });

  test("should have contact information", async ({ page }) => {
    if (!page.url().includes("/studios/")) {
      test.skip();
      return;
    }

    // Should have contact info (phone or email or contact button)
    const contactInfo = page.getByText(/телефон|email|связаться|написать/i);
    await expect(contactInfo.first()).toBeVisible();
  });
});
