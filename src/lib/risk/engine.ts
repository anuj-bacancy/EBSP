import type { FraudAction, TransactionRiskFactor } from "@/types/domain";

export interface RiskInput {
  amountCents: number;
  velocityCount: number;
  locationMismatch: boolean;
  deviceMismatch: boolean;
  merchantCategory: string;
  accountStatus?: "active" | "pending" | "frozen";
}

const mccWeights: Record<string, number> = {
  "4214": 120,
  "5047": 90,
  "5734": 140,
  "6012": 40,
  "6051": 220,
};

export function scoreTransactionRisk(input: RiskInput) {
  const factors: TransactionRiskFactor[] = [];
  let score = 100;

  const amountFactor = Math.min(1, input.amountCents / 250_000);
  score += Math.round(amountFactor * 280);
  factors.push({
    key: "amount",
    label: "Amount",
    value: amountFactor,
    weight: 0.35,
    reason: "Relative exposure against operating limit.",
  });

  const velocityFactor = Math.min(1, input.velocityCount / 5);
  score += Math.round(velocityFactor * 220);
  factors.push({
    key: "velocity",
    label: "Velocity",
    value: velocityFactor,
    weight: 0.25,
    reason: `${input.velocityCount} events observed inside the rolling 2-hour window.`,
  });

  if (input.locationMismatch) {
    score += 130;
    factors.push({
      key: "location",
      label: "Location mismatch",
      value: 0.8,
      weight: 0.15,
      reason: "Merchant geography diverges from KYC profile.",
    });
  }

  if (input.deviceMismatch) {
    score += 110;
    factors.push({
      key: "device",
      label: "Device mismatch",
      value: 0.7,
      weight: 0.1,
      reason: "Unknown device or IP fingerprint.",
    });
  }

  const mccWeight = mccWeights[input.merchantCategory] ?? 60;
  score += mccWeight;
  factors.push({
    key: "mcc",
    label: "Merchant category",
    value: Math.min(1, mccWeight / 220),
    weight: 0.15,
    reason: `Category ${input.merchantCategory} risk adjusted using deterministic sandbox weights.`,
  });

  if (input.accountStatus === "frozen") {
    score = 980;
    factors.push({
      key: "account_status",
      label: "Account status",
      value: 1,
      weight: 0.5,
      reason: "Frozen accounts always move to hard decline in sandbox mode.",
    });
  }

  score = Math.min(1000, score);

  let action: FraudAction = "allow";
  if (score >= 850) {
    action = "decline";
  } else if (score >= 700) {
    action = "review";
  } else if (score >= 450) {
    action = "flag";
  }

  return {
    score,
    action,
    factors,
  };
}
