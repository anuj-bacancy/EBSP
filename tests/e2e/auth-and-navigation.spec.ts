import { expect, test } from "@playwright/test";

test.describe("Landing and auth flows", () => {
  test("shows clear sign-up and sign-in calls to action on home page", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /Launch accounts, ACH, cards, webhooks, and compliance workflows/i,
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
  });

  test("navigates to sign-up page from landing CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL(/\/sign-up$/);
    await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Work email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("sign-in page renders required fields and guidance", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: "Sign in to Northstar" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByText("Use your Supabase users")).toBeVisible();
  });

  test("redirects unauthenticated users from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("heading", { name: "Sign in to Northstar" })).toBeVisible();
  });
});
