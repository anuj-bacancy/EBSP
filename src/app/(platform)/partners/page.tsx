import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBadge } from "@/components/ui/badge";
import { createPartnerAction, updatePartnerAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listFeeSchedules, listPartners } from "@/lib/data/app";

export default async function PartnersPage() {
  const session = await requireSession();
  const [partners, feeSchedules] = await Promise.all([listPartners(session), listFeeSchedules(session)]);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Multi-tenancy" title="Partner management" description="Branding, fee schedules, webhook configuration, environment modes, and tiering are all modeled at the partner level." />
      {session.role === "platform_admin" ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Create partner</h3>
            <form action={createPartnerAction} className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Northwind Treasury" />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" placeholder="northwind-treasury" />
              </div>
              <div>
                <Label htmlFor="primaryColor">Primary color</Label>
                <Input id="primaryColor" name="primaryColor" defaultValue="#0f766e" />
              </div>
              <div>
                <Label htmlFor="accentColor">Accent color</Label>
                <Input id="accentColor" name="accentColor" defaultValue="#f97316" />
              </div>
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input id="webhookUrl" name="webhookUrl" placeholder="https://partner.example/webhooks/northstar" />
              </div>
              <div>
                <Label htmlFor="rateLimitRpm">Rate limit RPM</Label>
                <Input id="rateLimitRpm" name="rateLimitRpm" defaultValue="600" type="number" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Create partner</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        {partners.map((partner) => {
          const fee = feeSchedules.find((schedule) => schedule.partnerId === partner.id);
          return (
            <Card key={partner.id}>
              <CardContent className="space-y-5 p-6">
                <form action={updatePartnerAction} className="space-y-4">
                  <input name="partnerId" type="hidden" value={partner.id} />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{partner.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">{partner.slug}</p>
                    </div>
                    <StatusBadge status={partner.status} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`name-${partner.id}`}>Display name</Label>
                      <Input id={`name-${partner.id}`} name="name" defaultValue={partner.name} />
                    </div>
                    <div>
                      <Label htmlFor={`status-${partner.id}`}>Status</Label>
                      <Input id={`status-${partner.id}`} name="status" defaultValue={partner.status} />
                    </div>
                    <div>
                      <Label htmlFor={`mode-${partner.id}`}>Environment</Label>
                      <Input id={`mode-${partner.id}`} name="environmentMode" defaultValue={partner.environmentMode} />
                    </div>
                    <div>
                      <Label htmlFor={`logo-${partner.id}`}>Logo text</Label>
                      <Input id={`logo-${partner.id}`} name="logoText" defaultValue={partner.branding.logoText} />
                    </div>
                    <div>
                      <Label htmlFor={`primary-${partner.id}`}>Primary color</Label>
                      <Input id={`primary-${partner.id}`} name="primaryColor" defaultValue={partner.branding.primaryColor} />
                    </div>
                    <div>
                      <Label htmlFor={`accent-${partner.id}`}>Accent color</Label>
                      <Input id={`accent-${partner.id}`} name="accentColor" defaultValue={partner.branding.accentColor} />
                    </div>
                    <div>
                      <Label htmlFor={`webhook-${partner.id}`}>Webhook URL</Label>
                      <Input id={`webhook-${partner.id}`} name="webhookUrl" defaultValue={partner.webhookUrl} />
                    </div>
                    <div>
                      <Label htmlFor={`rate-${partner.id}`}>Rate limit RPM</Label>
                      <Input id={`rate-${partner.id}`} name="rateLimitRpm" defaultValue={String(partner.rateLimitRpm)} />
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] p-4 md:col-span-2">
                      <p className="text-sm text-[var(--muted-foreground)]">Fee schedule</p>
                      <p className="mt-1 text-sm">ACH debit {fee?.achDebitFeeCents ?? 0}c • Issuance {fee?.cardIssuanceFeeCents ?? 0}c</p>
                    </div>
                  </div>
                  <Button type="submit" variant="outline">
                    Save partner
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
