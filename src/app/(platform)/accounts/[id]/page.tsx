import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { getAccountDetail } from "@/lib/data/app";
import { formatCurrency, titleCase } from "@/lib/utils";

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const detail = await getAccountDetail(session, id);

  if (!detail) {
    notFound();
  }
  const { account, endUser, cards, transfers, transactions } = detail;

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Account detail" title={account.nickname} description={`Owner: ${endUser?.legalName ?? "Unknown"} • ${titleCase(account.type)} • ${account.maskedAccountNumber}`} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBadge status={account.status} />
            <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <p>Available: {formatCurrency(account.balances.available)}</p>
              <p>Pending: {formatCurrency(account.balances.pending)}</p>
              <p>Ledger: {formatCurrency(account.balances.ledger)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Linked cards</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div key={card.id} className="rounded-2xl border border-[var(--border)] p-4">
                <p className="font-medium">{card.maskedPan}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{card.cardholderName}</p>
                <div className="mt-3">
                  <StatusBadge status={card.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transfers.map((transfer) => (
              <div key={transfer.id} className="rounded-2xl border border-[var(--border)] p-4">
                <p className="font-medium">{transfer.id}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{formatCurrency(transfer.amountCents)} • {transfer.speed}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transactions and audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-[var(--border)] p-4">
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{formatCurrency(transaction.amountCents)} • risk {transaction.riskScore}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
