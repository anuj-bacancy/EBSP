import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { updatePartnerAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { getPartnerSettings } from "@/lib/data/app";

export default async function SettingsPage() {
  const session = await requireSession();
  const partner = await getPartnerSettings(session);

  if (!partner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Settings" title="Workspace settings" description="Branding, environment mode, rate limits, and API docs defaults live here. The values are seeded and tenant-scoped in demo mode." />
      <Card>
        <CardHeader>
          <CardTitle>{partner.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePartnerAction} className="grid gap-4 md:grid-cols-2">
            <input name="partnerId" type="hidden" value={partner.id} />
            <input name="status" type="hidden" value={partner.status} />
            <input name="environmentMode" type="hidden" value={partner.environmentMode} />
            <div>
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" name="name" defaultValue={partner.name} />
            </div>
            <div>
              <Label htmlFor="logoText">Logo text</Label>
              <Input id="logoText" name="logoText" defaultValue={partner.branding.logoText} />
            </div>
            <div>
              <Label htmlFor="primaryColor">Primary color</Label>
              <Input id="primaryColor" name="primaryColor" defaultValue={partner.branding.primaryColor} />
            </div>
            <div>
              <Label htmlFor="accentColor">Accent color</Label>
              <Input id="accentColor" name="accentColor" defaultValue={partner.branding.accentColor} />
            </div>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input id="webhookUrl" name="webhookUrl" defaultValue={partner.webhookUrl} />
            </div>
            <div>
              <Label htmlFor="rateLimitRpm">Rate limit RPM</Label>
              <Input id="rateLimitRpm" name="rateLimitRpm" defaultValue={String(partner.rateLimitRpm)} />
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4 md:col-span-2">
              <p className="text-sm text-[var(--muted-foreground)]">Webhook secret preview</p>
              <p className="mt-1 font-semibold">{partner.webhookSecretPreview}</p>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
