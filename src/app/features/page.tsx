import { CreditCard, Landmark, Radar, ShieldCheck, SquareTerminal, Waves } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

const sections = [
  {
    title: "Account lifecycle and balances",
    copy: "Provision checking, savings, and business checking products with pending, active, suspended, frozen, and closed states plus available, pending, and ledger balances.",
    icon: Landmark,
  },
  {
    title: "KYC, compliance, and audit",
    copy: "Track individual KYC decisions, documents, OFAC/PEP placeholders, investigator assignments, immutable-style audit history, and compliance notes.",
    icon: ShieldCheck,
  },
  {
    title: "ACH and card sandbox",
    copy: "Run realistic same-day and next-day ACH simulations, issue virtual cards, configure spending controls, and inspect transfer and authorization outcomes.",
    icon: CreditCard,
  },
  {
    title: "AI risk scoring",
    copy: "Generate deterministic pseudo-ML risk scores with factor-level explainability and policy actions spanning allow, flag, review, and decline.",
    icon: Radar,
  },
  {
    title: "Webhooks and developer tooling",
    copy: "Manage webhook endpoints, retry failed deliveries, inspect signatures, rotate API keys, and test REST flows from the in-app sandbox console.",
    icon: SquareTerminal,
  },
  {
    title: "Analytics and billing placeholders",
    copy: "Expose KPI cards, charts, statement exports, subscription tiers, fee schedules, usage telemetry, and revenue-share placeholders for partner reviews.",
    icon: Waves,
  },
];

export default function FeaturesPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-12 px-6 py-16">
        <SectionTitle
          eyebrow="Capabilities"
          title="A complete embedded finance MVP surface"
          description="The feature set is intentionally wide enough for a strong product demo while staying honest about sandboxed provider abstractions and non-production regulated operations."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="inline-flex rounded-2xl bg-[var(--brand-500)]/10 p-3 text-[var(--brand-400)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="text-sm leading-7 text-[var(--muted-foreground)]">{section.copy}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
