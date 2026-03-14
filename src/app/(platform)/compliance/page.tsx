import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { ComplianceTable } from "@/features/compliance/compliance-table";
import { resolveComplianceCaseAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listComplianceCases } from "@/lib/data/app";

export default async function CompliancePage() {
  await requireSession();
  const complianceCases = await listComplianceCases();

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Controls" title="Compliance dashboard" description="CTR/SAR placeholder cases, AML alerts, investigator assignment, and regulator-facing audit visibility are modeled here as sandbox-first workflows." />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ComplianceTable data={complianceCases} />
        <Card>
          <CardHeader>
            <CardTitle>Program snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["AML alerts open", 3],
              ["CTR placeholders", 1],
              ["SAR placeholders", 0],
              ["OFAC escalations", 1],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {complianceCases
          .filter((item) => item.status !== "closed" && item.status !== "filed")
          .map((item) => (
            <form key={item.id} action={resolveComplianceCaseAction} className="rounded-2xl border border-[var(--border)] p-4">
              <input name="partnerId" type="hidden" value={item.partnerId} />
              <input name="caseId" type="hidden" value={item.id} />
              <input name="status" type="hidden" value="closed" />
              <p className="font-medium">{item.subject}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {item.type} • {item.severity} • {item.status}
              </p>
              <Button className="mt-3" size="sm" type="submit" variant="outline">
                Close case
              </Button>
            </form>
          ))}
      </div>
    </div>
  );
}
