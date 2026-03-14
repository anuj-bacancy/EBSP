import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { DownloadLinkButton } from "@/features/developer/download-link-button";
import { requireSession } from "@/lib/auth/session";
import { listStatements } from "@/lib/data/app";
import { formatCurrency } from "@/lib/utils";

export default async function StatementsPage() {
  const session = await requireSession();
  const statements = await listStatements(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Exports" title="Statements and exports" description="Monthly statement summaries and transaction exports are generated from tenant-scoped Supabase records for sandbox-ready reporting." />
      <div className="grid gap-4">
        {statements.map((statement) => (
          <Card key={statement.id}>
            <CardHeader>
              <CardTitle>{statement.month}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-center">
              <p className="text-sm text-[var(--muted-foreground)]">Opening {formatCurrency(statement.openingBalanceCents)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Closing {formatCurrency(statement.closingBalanceCents)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{statement.transactionCount} transactions</p>
              <DownloadLinkButton href={`/api/v1/statements/${statement.id}`} label="Download statement" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
