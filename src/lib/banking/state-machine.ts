import type { AccountStatus, TransferStatus } from "@/types/domain";

const accountTransitions: Record<AccountStatus, AccountStatus[]> = {
  pending: ["active", "suspended", "closed"],
  active: ["suspended", "frozen", "closed"],
  suspended: ["active", "frozen", "closed"],
  frozen: ["active", "closed"],
  closed: [],
};

const transferTransitions: Record<TransferStatus, TransferStatus[]> = {
  created: ["pending", "failed"],
  pending: ["submitted", "failed", "reversed"],
  submitted: ["settled", "failed", "returned"],
  settled: ["reversed"],
  failed: [],
  returned: [],
  reversed: [],
};

export function canTransitionAccount(from: AccountStatus, to: AccountStatus) {
  return accountTransitions[from].includes(to);
}

export function canTransitionTransfer(from: TransferStatus, to: TransferStatus) {
  return transferTransitions[from].includes(to);
}
