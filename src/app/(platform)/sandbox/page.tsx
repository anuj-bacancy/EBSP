import { SectionTitle } from "@/components/ui/section-title";
import { SandboxConsole } from "@/features/developer/sandbox-console";
import { requireSession } from "@/lib/auth/session";
import { listAccounts, listBeneficiaries, listEndUsers, listPartners } from "@/lib/data/app";

export default async function SandboxPage() {
  const session = await requireSession();
  const [partners, endUsers, accounts, beneficiaries] = await Promise.all([
    listPartners(session),
    listEndUsers(session),
    listAccounts(session),
    listBeneficiaries(session),
  ]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Sandbox" title="Developer sandbox controls" description="Test the demo route handlers directly from the UI for account creation, ACH transfer simulation, virtual card issuance, and JSON response inspection." />
      <SandboxConsole accounts={accounts} beneficiaries={beneficiaries} endUsers={endUsers} partners={partners} />
    </div>
  );
}
