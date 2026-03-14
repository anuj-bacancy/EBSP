import { describe, expect, it } from "vitest";

import { applyLedgerMutation } from "@/lib/banking/ledger";
import { scoreTransactionRisk } from "@/lib/risk/engine";

describe("transfer ledger integration", () => {
  it("applies a debit hold and produces a reviewable risk score", () => {
    const next = applyLedgerMutation(
      {
        available: 485000,
        pending: 0,
        ledger: 485000,
      },
      {
        amountCents: 22000,
        direction: "debit",
        settleImmediately: false,
      },
    );

    const risk = scoreTransactionRisk({
      amountCents: 22000,
      velocityCount: 3,
      locationMismatch: true,
      deviceMismatch: false,
      merchantCategory: "4214",
      accountStatus: "active",
    });

    expect(next.pending).toBe(-22000);
    expect(next.ledger).toBe(463000);
    expect(risk.score).toBeGreaterThan(400);
    expect(["flag", "review", "decline"]).toContain(risk.action);
  });
});
