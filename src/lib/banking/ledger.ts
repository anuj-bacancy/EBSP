export interface LedgerBalances {
  available: number;
  pending: number;
  ledger: number;
}

export interface LedgerMutation {
  amountCents: number;
  direction: "credit" | "debit";
  settleImmediately?: boolean;
}

export function applyLedgerMutation(
  balances: LedgerBalances,
  mutation: LedgerMutation,
): LedgerBalances {
  const multiplier = mutation.direction === "credit" ? 1 : -1;
  const nextLedger = balances.ledger + mutation.amountCents * multiplier;

  if (mutation.settleImmediately) {
    return {
      available: balances.available + mutation.amountCents * multiplier,
      pending: balances.pending,
      ledger: nextLedger,
    };
  }

  return {
    available: balances.available,
    pending: balances.pending + mutation.amountCents * multiplier,
    ledger: nextLedger,
  };
}
