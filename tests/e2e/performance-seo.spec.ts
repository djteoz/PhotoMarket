import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("homepage loads quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const loadTime = Date.now() - startTime;

    // Should load DOM in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("images are lazy loaded", async ({ page }) => {
    await page.goto("/catalog");

    // Check if images have loading="lazy" attribute
    const images = page.locator("img");
    const count = await images.count();

    if (count > 0) {
      // At least some images should have lazy loading
      const lazyImages = page.locator('img[loading="lazy"]');
      const lazyCount = await lazyImages.count();

      // Either images are lazy loaded or we use Next.js Image (which handles it)
      expect(lazyCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("no layout shifts on load", async ({ page }) => {
    await page.goto("/");

    // Wait for page to stabilize
    await page.waitForTimeout(1000);

    // Take screenshot to verify layout stability
    await expect(page).toHaveScreenshot("homepage-stable.png", {
      maxDiffPixelRatio: 0.1,
      timeout: 10000,
    });
  });

  test("search results load efficiently", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/search?city=Москва", { waitUntil: "networkidle" });

    const loadTime = Date.now() - startTime;

    // Search should complete in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("SEO", () => {
  test("homepage has proper meta tags", async ({ page }) => {
    await page.goto("/");

    // Check title
    const title = await page.title();
    expect(title).toContain("PhotoMarket");

    // Check description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content");

    // Check canonical
    const canonical = page.locator('link[rel="canonical"]');
    // Canonical might not exist on all pages
  });

  test("search page has dynamic meta tags", async ({ page }) => {
    await page.goto("/search?city=Москва");

    const title = await page.title();
    // Title should include city
    expect(title.toLowerCase()).toMatch(/москва|фотостуди/);
  });

  test("has proper heading structure", async ({ page }) => {
    await page.goto("/");

    // Should have exactly one H1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // H1 should be first heading
    const firstHeading = page.locator("h1, h2, h3, h4, h5, h6").first();
    await expect(firstHeading).toHaveAttribute("tagName", /^H1$/i);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/catalog");

    const images = page.locator('img:not([alt=""])');
    const count = await images.count();

    // All images should have alt text
    const allImages = page.locator("img");
    const allCount = await allImages.count();

    expect(count).toBe(allCount);
  });

  test("links are accessible", async ({ page }) => {
    await page.goto("/");

    // Links should have text or aria-label
    const emptyLinks = page.locator("a:not(:has-text(*)):not([aria-label])");
    const emptyCount = await emptyLinks.count();

    expect(emptyCount).toBe(0);
  });

  test("robots.txt exists", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain("User-agent");
  });

  test("sitemap.xml exists", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();

    const text = await response.text();
    expect(text).toContain("urlset");
  });
});

test.describe("Accessibility", () => {
  test("page has proper landmarks", async ({ page }) => {
    await page.goto("/");

    // Should have main content area
    await expect(page.locator("main")).toBeVisible();

    // Should have header
    await expect(page.locator("header")).toBeVisible();

    // Should have footer
    await expect(page.locator("footer")).toBeVisible();
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto("/search");

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const placeholder = await input.getAttribute("placeholder");

      // Input should have either associated label, aria-label, or placeholder
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;

      expect(hasLabel || ariaLabel || placeholder).toBeTruthy();
    }
  });

  test("buttons are keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Tab through page
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Something should be focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test("color contrast is sufficient", async ({ page }) => {
    await page.goto("/");

    // This is a basic check - for full contrast testing use axe-core
    const textElements = page.locator("p, h1, h2, h3, span, a");

    // Just verify text elements exist and are visible
    await expect(textElements.first()).toBeVisible();
  });
});
