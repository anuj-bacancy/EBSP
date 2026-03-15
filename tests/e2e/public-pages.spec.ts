import { expect, test } from "@playwright/test";

test.describe("Public marketing pages", () => {
  test("pricing page shows all plans with expected CTAs", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: "Simple pricing tiers" })).toBeVisible();
    await expect(page.getByText("Starter", { exact: true })).toBeVisible();
    await expect(page.getByText("Growth", { exact: true })).toBeVisible();
    await expect(page.getByText("Enterprise", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Get started" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Talk to sales" })).toBeVisible();
  });

  test("docs page is reachable from top navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Docs" }).click();

    await expect(page).toHaveURL(/\/docs$/);
    await expect(page.getByRole("heading", { name: "REST-style API reference and sandbox guide" })).toBeVisible();
  });

  test("features page renders core capability heading", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByRole("heading", { name: "A complete embedded finance MVP surface" })).toBeVisible();
  });

  test("request-demo page renders lead form", async ({ page }) => {
    await page.goto("/request-demo");
    await expect(page.getByRole("heading", { name: "Book a partner architecture walkthrough" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit request" })).toBeVisible();
  });

  test("forgot-password page renders reset form", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: "Reset password" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("verify-email page renders confirmation helper text", async ({ page }) => {
    await page.goto("/auth/verify-email?email=test@example.com");
    await expect(page.getByRole("heading", { name: "Verify your email" })).toBeVisible();
    await expect(page.getByText("Confirmation link sent to")).toBeVisible();
  });
});
