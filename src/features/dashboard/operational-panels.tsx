import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { FraudAlert, Transfer } from "@/types/domain";

export function OperationalPanels({
  transfers,
  fraudAlerts,
  endUserCount,
  approvedKycCount,
  fundedCount,
}: {
  transfers: Transfer[];
  fraudAlerts: FraudAlert[];
  endUserCount: number;
  approvedKycCount: number;
  fundedCount: number;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Transfer success vs failure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-4 py-3">
              <div>
                <p className="font-medium">{transfer.id}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{formatCurrency(transfer.amountCents)}</p>
              </div>
              <StatusBadge status={transfer.status} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Onboarding funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["Signups", endUserCount],
            ["KYC submitted", endUserCount],
            ["Approved", approvedKycCount],
            ["Funded", fundedCount],
          ].map(([label, value]) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div className="h-2 rounded-full bg-[var(--brand-500)]" style={{ width: `${(Number(value) / Math.max(endUserCount, 1)) * 100}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fraud queue snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fraudAlerts.map((alert) => (
            <div key={alert.id} className="rounded-2xl border border-[var(--border)] px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{alert.summary}</p>
                <StatusBadge status={alert.status} />
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">Risk score {alert.score} • Action {alert.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
