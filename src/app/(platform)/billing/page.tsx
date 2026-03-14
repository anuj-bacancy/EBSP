import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { listFeeSchedules, listPartners } from "@/lib/data/app";
import { formatCurrency } from "@/lib/utils";

export default async function BillingPage() {
  const session = await requireSession();
  const [partners, feeSchedules] = await Promise.all([listPartners(session), listFeeSchedules(session)]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Billing" title="Fee schedules and subscription placeholders" description="Subscription tiers, per-transaction fees, and revenue-share fields are modeled so the MVP can tell a credible monetization story without pretending live billing exists." />
      <div className="grid gap-6 xl:grid-cols-2">
        {partners.map((partner) => {
          const fee = feeSchedules.find((entry) => entry.partnerId === partner.id);
          return (
            <Card key={partner.id}>
              <CardHeader>
                <CardTitle>{partner.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Plan</p>
                  <p className="mt-1 font-semibold">{partner.plan}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Revenue share</p>
                  <p className="mt-1 font-semibold">{fee?.revenueShareBps ?? 0} bps</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">ACH debit fee</p>
                  <p className="mt-1 font-semibold">{formatCurrency(fee?.achDebitFeeCents ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <p className="text-sm text-[var(--muted-foreground)]">Card issuance fee</p>
                  <p className="mt-1 font-semibold">{formatCurrency(fee?.cardIssuanceFeeCents ?? 0)}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
