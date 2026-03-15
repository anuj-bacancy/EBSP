import { expect, test } from "@playwright/test";

test.describe("API auth guards", () => {
  test("blocks unauthenticated account creation", async ({ request }) => {
    const response = await request.post("/api/v1/accounts", {
      data: {
        partnerId: "00000000-0000-0000-0000-000000000001",
        endUserId: "00000000-0000-0000-0000-000000000002",
        type: "checking",
        nickname: "Ops Account",
      },
    });

    expect(response.status()).toBe(401);
    const body = (await response.json()) as { error?: string };
    expect(body.error?.toLowerCase()).toContain("authentication");
  });

  test("blocks unauthenticated card issuance", async ({ request }) => {
    const response = await request.post("/api/v1/cards", {
      data: {
        partnerId: "00000000-0000-0000-0000-000000000001",
        accountId: "00000000-0000-0000-0000-000000000003",
        cardholderName: "Test Holder",
        dailyLimitCents: 50000,
      },
    });

    expect(response.status()).toBe(401);
    const body = (await response.json()) as { error?: string };
    expect(body.error?.toLowerCase()).toContain("authentication");
  });

  test("blocks unauthenticated kyc case creation", async ({ request }) => {
    const response = await request.post("/api/v1/kyc", {
      data: {
        partnerId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        endUserId: "7f1f6f0d-d336-4e0f-a8c9-c50aaf84be9b",
      },
    });

    expect([401, 404]).toContain(response.status());
    const body = (await response.json()) as { error?: string };
    expect(body.error?.toLowerCase()).toMatch(/authentication|not found/);
  });

  test("blocks unauthenticated transaction export", async ({ request }) => {
    const response = await request.get("/api/v1/transactions/export");

    expect(response.status()).toBe(401);
    const body = (await response.json()) as { error?: string };
    expect(body.error?.toLowerCase()).toContain("next_redirect");
  });
});
