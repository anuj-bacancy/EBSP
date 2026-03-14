import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CreditCard, Radar, ShieldCheck, SquareTerminal } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

const featureCards = [
  {
    title: "Accounts and ledger orchestration",
    copy: "Create checking, savings, and business checking products with deterministic lifecycle controls, balance views, and demo-safe ledger consistency.",
    icon: Building2,
  },
  {
    title: "ACH, cards, and sandbox providers",
    copy: "Simulate same-day ACH, virtual card issuance, idempotent APIs, and webhook delivery with clean abstractions for future real providers.",
    icon: CreditCard,
  },
  {
    title: "Compliance and risk visibility",
    copy: "Run mock KYC, OFAC/PEP screening, fraud scoring, and audit traces through a polished dashboard built for demos and product reviews.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[var(--brand-400)]">
              <SquareTerminal className="h-4 w-4" />
              Embedded Banking-as-a-Service Platform
            </span>
            <div className="space-y-5">
              <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
                Launch accounts, ACH, cards, webhooks, and compliance workflows from a single sandbox control plane.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">
                Northstar BaaS Cloud is a polished, demo-ready multi-tenant platform built for partner operations, compliance teams, and developers who need embedded finance workflows without a traditional backend server.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start sandbox
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/docs">Explore API docs</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["5 demo roles", "Platform, compliance, partner, and end-user personas"],
                ["18 core pages", "Operations, fraud, billing, statements, and docs"],
                ["Supabase-ready", "Migrations, RLS, auth helpers, and seed flow included"],
              ].map(([label, copy]) => (
                <div key={label} className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5">
                  <p className="text-lg font-semibold">{label}</p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Northstar control tower</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                "Account lifecycle orchestration with tenant-aware state machines",
                "KYC queue, OFAC/PEP placeholders, and audit-ready decisions",
                "ACH simulation with idempotency keys and return code handling",
                "Virtual card issuance, controls, and risk explainability",
                "Webhook replay, delivery metadata, and API explorer docs",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--brand-400)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-20 space-y-8">
          <SectionTitle
            eyebrow="MVP surface"
            title="Feature depth aligned to the hackathon BRD"
            description="The app ships with seeded organizations, partner memberships, KYC cases, transfers, cards, fraud alerts, webhook logs, and analytics so the product feels complete immediately."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title}>
                  <CardContent className="space-y-4 p-6">
                    <div className="inline-flex rounded-2xl bg-[var(--brand-500)]/10 p-3 text-[var(--brand-400)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-7 text-[var(--muted-foreground)]">{feature.copy}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-8">
              <SectionTitle
                eyebrow="AI sandbox"
                title="Deterministic transaction risk scoring with explainability"
                description="Every demo transaction carries score factors across amount, velocity, location, device, and merchant category risk, then maps to allow, flag, review, or decline."
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-8">
              <div className="flex items-center gap-3 text-[var(--brand-400)]">
                <Radar className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em]">Risk engine</span>
              </div>
              <p className="text-4xl font-semibold">0-1000</p>
              <p className="text-sm text-[var(--muted-foreground)]">Score range with sandbox rules for frozen accounts, high-risk MCCs, rapid velocity, and device/IP mismatches.</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
