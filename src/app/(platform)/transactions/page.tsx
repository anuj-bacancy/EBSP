import { SectionTitle } from "@/components/ui/section-title";
import { DownloadLinkButton } from "@/features/developer/download-link-button";
import { TransactionsTable } from "@/features/transactions/transactions-table";
import { requireSession } from "@/lib/auth/session";
import { listTransactions } from "@/lib/data/app";

export default async function TransactionsPage() {
  const session = await requireSession();
  const transactions = await listTransactions(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Explorer" title="Transactions" description="Filter across ACH, card, and adjustment transactions with deterministic risk scores and status telemetry." />
      <div className="flex justify-end">
        <DownloadLinkButton href="/api/v1/transactions/export" label="Export CSV" />
      </div>
      <TransactionsTable data={transactions} />
    </div>
  );
}
