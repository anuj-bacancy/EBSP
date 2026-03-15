import { expect, test } from "@playwright/test";

const protectedRoutes = [
  "/dashboard",
  "/accounts",
  "/transfers",
  "/cards",
  "/kyc",
  "/compliance",
  "/transactions",
  "/webhooks",
  "/notifications",
  "/billing",
  "/analytics",
  "/statements",
  "/api-keys",
  "/audit-logs",
  "/end-users",
  "/partners",
  "/sandbox",
  "/settings",
  "/team",
];

test.describe("Protected route guards", () => {
  for (const route of protectedRoutes) {
    test(`redirects unauthenticated user from ${route} to sign-in`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/sign-in$/);
      await expect(page.getByRole("heading", { name: "Sign in to Northstar" })).toBeVisible();
    });
  }
});
