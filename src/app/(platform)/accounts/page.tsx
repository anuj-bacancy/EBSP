import { SectionTitle } from "@/components/ui/section-title";
import { AccountsTable } from "@/features/accounts/accounts-table";
import { requireSession } from "@/lib/auth/session";
import { listAccounts } from "@/lib/data/app";

export default async function AccountsPage() {
  const session = await requireSession();
  const accounts = await listAccounts(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Accounts" title="Account lifecycle management" description="Explore the seeded portfolio of checking, savings, and business checking accounts. Detail pages include cards, transfers, transactions, and audit context." />
      <AccountsTable data={accounts} />
    </div>
  );
}
