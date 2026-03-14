import { SectionTitle } from "@/components/ui/section-title";
import { TransfersTable } from "@/features/transfers/transfers-table";
import { requireSession } from "@/lib/auth/session";
import { listTransfers } from "@/lib/data/app";

export default async function TransfersPage() {
  const session = await requireSession();
  const transfers = await listTransfers(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="ACH" title="Transfer processing" description="Track ACH credits and debits across created, pending, submitted, settled, failed, returned, and reversed states with sandbox return codes." />
      <TransfersTable data={transfers} />
    </div>
  );
}
