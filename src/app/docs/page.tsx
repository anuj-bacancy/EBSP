import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";

const endpoints = [
  ["POST", "/api/v1/accounts", "Create a sandbox checking, savings, or business checking account"],
  ["POST", "/api/v1/transfers", "Create a persistent ACH credit/debit transfer with idempotency support"],
  ["POST", "/api/v1/cards", "Issue a virtual debit card with spending controls"],
  ["POST", "/api/v1/kyc", "Run the sandbox KYC engine and persist the review case"],
  ["POST", "/api/v1/kyc/documents", "Upload KYC files into Supabase Storage"],
  ["POST", "/api/v1/webhooks/replay", "Replay a failed webhook delivery and return a signed payload"],
  ["GET", "/api/v1/transactions/export", "Download a tenant-scoped transaction CSV export"],
  ["GET", "/api/v1/statements/:id", "Download a generated statement file"],
];

export default function DocsPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <SectionTitle
          eyebrow="Developer Docs"
          title="REST-style API reference and sandbox guide"
          description="This demo ships with grouped endpoint docs, cURL samples, sandbox behavior notes, webhook signing details, and a live API explorer page inside the authenticated workspace."
        />
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {endpoints.map(([method, path, description]) => (
                <div key={path} className="rounded-2xl border border-[var(--border)] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[var(--brand-500)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-400)]">{method}</span>
                    <code className="text-sm">{path}</code>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted-foreground)]">{description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick cURL</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-[24px] bg-black/30 p-4 text-xs leading-6 text-[var(--muted-foreground)]">
{`curl -X POST http://localhost:3000/api/v1/transfers \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ns_live_..." \\
  -d '{
    "accountId": "40000000-0000-0000-0000-000000000001",
    "beneficiaryId": "31000000-0000-0000-0000-000000000001",
    "amountCents": 22000,
    "direction": "debit",
    "speed": "same_day",
    "idempotencyKey": "idem-acme-22000"
  }'`}
              </pre>
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                For setup, auth, seed data, and the expanded endpoint reference, see [README](/Users/macbookpro/Desktop/BFG/README.md) and [docs/api/reference.md](/Users/macbookpro/Desktop/BFG/docs/api/reference.md).
              </p>
              <Link className="mt-5 inline-flex text-sm font-semibold text-[var(--brand-400)]" href="/sign-in">
                Open the authenticated API explorer
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
