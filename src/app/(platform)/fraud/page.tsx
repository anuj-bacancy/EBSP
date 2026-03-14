// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { FraudTable } from "@/features/compliance/compliance-table";
import { resolveFraudAlertAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listFraudAlerts, listRiskRules } from "@/lib/data/app";

export default async function FraudPage() {
  const session = await requireSession();
  const [fraudAlerts, riskRules] = await Promise.all([listFraudAlerts(session), listRiskRules()]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="AI Risk" title="Fraud dashboard" description="Monitor open alerts, risk actions, score distributions, and explainability signals from the sandbox risk engine." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <FraudTable data={fraudAlerts} />
        <Card>
          <CardHeader>
            <CardTitle>Rules engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskRules.map((rule) => (
              <div key={rule.id} className="rounded-2xl border border-[var(--border)] p-4">
                <p className="font-medium">{rule.name}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Threshold {rule.threshold} → {rule.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {fraudAlerts
          .filter((alert) => alert.status !== "resolved")
          .map((alert) => (
            <form key={alert.id} action={resolveFraudAlertAction} className="rounded-2xl border border-[var(--border)] p-4">
              <input name="partnerId" type="hidden" value={alert.partnerId} />
              <input name="alertId" type="hidden" value={alert.id} />
              <p className="font-medium">{alert.summary}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Score {alert.score} to action {alert.action}
              </p>
              <Button className="mt-3" size="sm" type="submit" variant="outline">
                Resolve alert
              </Button>
            </form>
          ))}
      </div>
    </div>
  );
}
