// client/e2e/checkout.spec.js
// E2E test for the core checkout flow: browse -> add to cart -> checkout -> simulate payment -> confirmation
//
// Strategy:
//   - All backend API calls to localhost:5000 are mocked via page.route()
//   - Firebase modules are mocked by intercepting Vite pre-bundled deps:
//     firebase/auth  -> returns a test user (onAuthStateChanged fires immediately)
//     firebase/app   -> returns a stub app (initializeApp does nothing)
//   - localStorage.dev_token is set via addInitScript so getAuthHeaders() works
//   - The test runs against the Vite dev server (assumed running on localhost:5173)

import { test, expect } from "@playwright/test";
import { MOCK_AUTH_SCRIPT, MOCK_APP_SCRIPT } from "./firebaseAuthMock.js";
import {
  MOCK_PRODUCTS,
  MOCK_CART_EMPTY,
  MOCK_CART_WITH_ITEM,
  MOCK_USER_PROFILE,
  MOCK_DISCOUNT_STATUS,
  MOCK_DEMO_PAYMENT,
} from "./mockData.js";

const BASE_URL = "http://localhost:5173";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Intercept all API requests to localhost:5000 and return mock data.
 *  NOTE: This is called inside each test (not beforeEach) to avoid route
 *  handler ordering issues when tests need to override specific endpoints. */
async function setupDefaultApiMocks(page) {
  await page.route("**/localhost:5000/api/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── Products ──────────────────────────────────────────────────────────
    if (url.includes("/api/products")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_PRODUCTS),
      });
    }

    // ── Cart GET ──────────────────────────────────────────────────────────
    if (url.includes("/api/cart/") && method === "GET") {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_CART_WITH_ITEM),
      });
    }

    // ── Cart POST (add / remove) ─────────────────────────────────────────
    if (url.includes("/api/cart/") && method === "POST") {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_CART_WITH_ITEM),
      });
    }

    // ── Profile ──────────────────────────────────────────────────────────
    if (url.includes("/api/user/profile/")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_USER_PROFILE),
      });
    }

    // ── Discount status ──────────────────────────────────────────────────
    if (url.includes("/api/user/discount-status/")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_DISCOUNT_STATUS),
      });
    }

    // ── User login (welcome discount check) ──────────────────────────────
    if (url.includes("/api/user/login") || url.includes("/api/user/dismiss-banner")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          showBanner: false,
          discountUsed: false,
          discountPercent: 10,
        }),
      });
    }

    // ── Demo payment / clear-cart / use-discount ─────────────────────────
    if (url.includes("/api/payment/demo-success")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_DEMO_PAYMENT),
      });
    }

    if (url.includes("/api/payment/clear-cart") || url.includes("/api/user/use-discount")) {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    }

    // ── Fallback ─────────────────────────────────────────────────────────
    console.warn("[mock] Unhandled API route:", method, url);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

/** Set up Firebase auth + app mocks before navigation. */
async function setupFirebaseMocks(page) {
  // Intercept the Vite pre-bundled firebase/auth dependency.
  // Served from /node_modules/.vite/deps/firebase_auth.js?v=...
  await page.route("**firebase_auth*", async (route) => {
    return route.fulfill({
      contentType: "application/javascript",
      body: MOCK_AUTH_SCRIPT,
    });
  });

  // Also intercept firebase/app (initializeApp could throw with unset env vars).
  await page.route("**firebase_app*", async (route) => {
    return route.fulfill({
      contentType: "application/javascript",
      body: MOCK_APP_SCRIPT,
    });
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Firebase mocks must be set before goto()
    await setupFirebaseMocks(page);

    // Set dev token so getAuthHeaders() returns mock Authorization header
    await page.addInitScript(() => {
      localStorage.setItem("dev_token", "mock-dev-token-for-e2e");
    });
  });

  test("complete checkout flow — homepage to payment confirmation", async ({ page }) => {
    // Set up API mocks inside the test so they can be overridden if needed
    await setupDefaultApiMocks(page);

    // ── 1. Go to homepage (not redirected to /auth since auth is mocked) ───
    await page.goto(`${BASE_URL}/home`, { waitUntil: "networkidle" });

    // Should land on homepage
    await expect(page).toHaveURL(/\/home/);
    await expect(page.locator("h1")).toContainText("stronger");

    // ── 2. Find first product card and add to cart ────────────────────────
    const addToCartButton = page.locator("button", { hasText: "Add to Cart" }).first();
    await expect(addToCartButton).toBeVisible({ timeout: 15000 });
    await addToCartButton.click();

    // After adding, the button briefly shows "Added ✓" then switches to
    // quantity controls (a div with - / quantity / + buttons).
    // Look for the quantity display span within the product card controls.
    const qtyDisplay = page
      .locator("div.overflow-hidden span.text-xs.text-stone-900")
      .and(page.locator("text=1"));
    await expect(qtyDisplay).toBeVisible({ timeout: 10000 });

    // ── 3. Navigate to /checkout ─────────────────────────────────────────
    // We navigate directly instead of via the cart drawer because the Navbar's
    // cart icon may not have a reliable selector for Playwright to click.
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

    // Should see the order review page with "Your Order" heading
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator("h1")).toContainText("Your Order");

    // Wait for the product item to appear in the cart list
    const productItem = page.locator("text=Premium Resistance Bands Set").first();
    await expect(productItem).toBeVisible({ timeout: 10000 });

    // ── 4. Verify address selector and summary are visible ───────────────
    // The address selector should show the default address label
    await expect(page.locator("text=Home").first()).toBeVisible({ timeout: 10000 });

    // The summary panel should be visible
    await expect(page.locator("text=Summary")).toBeVisible();

    // ── 5. Proceed to payment ───────────────────────────────────────────
    const proceedButton = page.locator('button[aria-label*="Proceed"], button:has-text("Proceed to Payment")').first();
    await expect(proceedButton).toBeEnabled({ timeout: 5000 });
    await proceedButton.click();

    // Should land on the payment page
    await expect(page).toHaveURL(/\/payment/);
    await expect(page.locator("h1")).toContainText("Payment");

    // ── 6. Simulate a successful payment ─────────────────────────────────
    // Wait for the page to render the "Simulate Successful Payment" button
    const simulateButton = page.locator('button:has-text("Simulate Successful Payment")');
    await expect(simulateButton).toBeVisible({ timeout: 10000 });
    await simulateButton.click();

    // ── 7. Verify payment confirmation page ─────────────────────────────
    await expect(page).toHaveURL(/\/payment-confirmation/, { timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Payment Successful");

    // Verify the purchased items are shown on the confirmation page
    await expect(page.locator("text=Premium Resistance Bands Set").first()).toBeVisible({ timeout: 5000 });

    // Verify the "Continue Shopping" button is present
    const continueButton = page.locator('button:has-text("Continue Shopping")');
    await expect(continueButton).toBeVisible();

    // ── 8. Navigate back to home ─────────────────────────────────────────
    await continueButton.click();
    await expect(page).toHaveURL(/\/home/);
  });

  test("handles empty cart gracefully on checkout page", async ({ page }) => {
    // Set up API mocks, overriding cart routes with empty cart data
    await page.route("**/localhost:5000/api/cart/**", async (route) => {
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_CART_EMPTY),
      });
    });

    // Set up remaining API routes (non-cart) with defaults
    await page.route("**/localhost:5000/api/**", async (route) => {
      const url = route.request().url();

      if (url.includes("/api/products")) {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(MOCK_PRODUCTS),
        });
      }

      if (url.includes("/api/user/profile/")) {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(MOCK_USER_PROFILE),
        });
      }

      if (url.includes("/api/user/discount-status/")) {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify(MOCK_DISCOUNT_STATUS),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    // Navigate to checkout page
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle" });

    // Should show empty cart state
    await expect(page.locator("text=Your cart is empty").first()).toBeVisible({ timeout: 10000 });

    // Should have a "Continue Shopping" button
    const continueShopping = page.locator('button:has-text("Continue Shopping")');
    await expect(continueShopping).toBeVisible();
  });
});
