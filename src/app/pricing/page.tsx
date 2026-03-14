import { CheckCircle2 } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

const plans = [
  {
    name: "Starter",
    price: "$499",
    copy: "Best for early-stage SaaS teams validating embedded banking flows.",
    features: ["1 sandbox partner tenant", "500 API requests/min", "Core accounts + ACH", "Basic webhook logging"],
  },
  {
    name: "Growth",
    price: "$1,499",
    copy: "Operational visibility for teams launching cards, webhooks, and fraud workflows.",
    features: ["Everything in Starter", "Fraud and compliance dashboards", "Card issuing sandbox", "Priority partner support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    copy: "For scaled partner portfolios, governance workflows, and custom provider integrations.",
    features: ["Everything in Growth", "Advanced RLS tenancy model", "Dedicated compliance queues", "Custom onboarding and SLAs"],
  },
];

export default function PricingPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <SectionTitle eyebrow="Pricing" title="Simple demo pricing tiers" description="Billing is placeholder-first in this MVP, but the pricing model and fee schedule primitives are represented end to end." />
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name}>
              <CardContent className="space-y-6 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[var(--brand-400)]">{plan.name}</p>
                  <p className="mt-3 text-4xl font-semibold">{plan.price}</p>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">{plan.copy}</p>
                </div>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--brand-400)]" />
                      <p className="text-sm text-[var(--muted-foreground)]">{feature}</p>
                    </div>
                  ))}
                </div>
                <Button className="w-full">{plan.name === "Enterprise" ? "Talk to sales" : "Start sandbox"}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
