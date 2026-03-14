import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/ui/badge";
import { Card as Surface, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { getCardDetail } from "@/lib/data/app";
import { formatCurrency } from "@/lib/utils";

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const card = await getCardDetail(session, id);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Card detail" title={card.maskedPan} description={`${card.cardholderName} • ${card.network} • expires ${card.expiry}`} />
      <div className="grid gap-6 xl:grid-cols-3">
        <Surface>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={card.status} />
          </CardContent>
        </Surface>
        <Surface className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Spending controls</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">Daily limit</p>
              <p className="mt-2 font-semibold">{formatCurrency(card.spendingControls.dailyLimitCents)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">Per transaction</p>
              <p className="mt-2 font-semibold">{formatCurrency(card.spendingControls.transactionLimitCents)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted-foreground)]">MCC controls</p>
              <p className="mt-2 text-sm">{card.spendingControls.merchantCategoryAllowlist.join(", ")}</p>
            </div>
          </CardContent>
        </Surface>
      </div>
    </div>
  );
}
