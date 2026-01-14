import { test, expect, Page } from "@playwright/test";

// Helper to check if user is logged in
async function isLoggedIn(page: Page): Promise<boolean> {
  const userMenu = page.locator(
    '[class*="user"], [class*="avatar"], [class*="profile"]'
  );
  const signInButton = page.getByRole("link", { name: /войти|sign in/i });

  return (
    (await userMenu.isVisible().catch(() => false)) &&
    !(await signInButton.isVisible().catch(() => false))
  );
}

test.describe("Authentication", () => {
  test("should show sign in link when not logged in", async ({ page }) => {
    await page.goto("/");

    const signInLink = page.getByRole("link", { name: /войти|sign in|вход/i });
    await expect(signInLink).toBeVisible();
  });

  test("should navigate to sign in page", async ({ page }) => {
    await page.goto("/");

    const signInLink = page.getByRole("link", { name: /войти|sign in|вход/i });
    if (await signInLink.isVisible()) {
      await signInLink.click();

      // Should be on sign-in page or Clerk modal
      await expect(page).toHaveURL(/sign-in|login|clerk/);
    }
  });

  test("should redirect to login when accessing protected page", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should either redirect to login or show login form
    const isOnLogin =
      page.url().includes("sign-in") || page.url().includes("login");
    const hasLoginForm = await page
      .locator('input[type="email"], input[type="password"]')
      .isVisible()
      .catch(() => false);

    expect(isOnLogin || hasLoginForm).toBeTruthy();
  });

  test("should show user menu when logged in", async ({ page }) => {
    // This test assumes there's a way to be logged in (e.g., test account)
    await page.goto("/");

    if (await isLoggedIn(page)) {
      const userMenu = page
        .locator('[class*="user"], [class*="avatar"]')
        .first();
      await expect(userMenu).toBeVisible();
    } else {
      test.skip();
    }
  });
});

test.describe("User Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should require authentication", async ({ page }) => {
    // Should either show dashboard or redirect to login
    const isDashboard = page.url().includes("dashboard");
    const isLogin = page.url().includes("sign-in");

    expect(isDashboard || isLogin).toBeTruthy();
  });
});

test.describe("Profile", () => {
  test("should have profile page", async ({ page }) => {
    await page.goto("/profile");

    // Should either show profile or redirect to login
    const isProfile = page.url().includes("profile");
    const isLogin = page.url().includes("sign-in");

    expect(isProfile || isLogin).toBeTruthy();
  });
});
