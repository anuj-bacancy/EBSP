import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { KycDocumentUpload } from "@/features/kyc/kyc-document-upload";
import { KycTable } from "@/features/kyc/kyc-table";
import { updateKycCaseAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listEndUsers, listKycCases } from "@/lib/data/app";

export default async function KycPage() {
  const session = await requireSession();
  const [kycCases, endUsers] = await Promise.all([listKycCases(session), listEndUsers(session)]);
  const partnerId = session.currentPartnerId ?? session.memberships[0]?.partner_id ?? "";

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Identity" title="KYC review queue" description="Review sandbox provider decisions, OFAC/PEP flags, document status, and reason codes for pending or escalated onboarding cases." />
      <KycTable data={kycCases} />
      {partnerId ? <KycDocumentUpload endUsers={endUsers} partnerId={partnerId} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {kycCases
          .filter((item) => item.status !== "approved")
          .map((item) => (
            <form key={item.id} action={updateKycCaseAction} className="rounded-2xl border border-[var(--border)] p-4">
              <input name="partnerId" type="hidden" value={item.partnerId} />
              <input name="caseId" type="hidden" value={item.id} />
              <input name="status" type="hidden" value="approved" />
              <input name="notes" type="hidden" value="Approved from dashboard review." />
              <p className="font-medium">
                {item.providerDecision} decision for {item.endUserId}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {item.reasons.join(", ")} • OFAC {String(item.ofacFlag)} • PEP {String(item.pepFlag)}
              </p>
              <Button className="mt-3" size="sm" type="submit" variant="outline">
                Approve case
              </Button>
            </form>
          ))}
      </div>
    </div>
  );
}
