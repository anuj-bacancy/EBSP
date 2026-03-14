import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { Textarea } from "@/components/ui/textarea";

export default function RequestDemoPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-6 py-16">
        <SectionTitle eyebrow="Request Demo" title="Book a partner architecture walkthrough" description="The form is intentionally lightweight for the MVP. In production this would route into CRM, onboarding, and partner risk workflows." />
        <Card>
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue="Morgan Lee" />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" defaultValue="Northstar Prospect" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue="morgan@example.com" />
            </div>
            <div>
              <Label htmlFor="volume">Estimated monthly volume</Label>
              <Input id="volume" defaultValue="$2M" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="notes">Use case</Label>
              <Textarea id="notes" defaultValue="We want to embed checking accounts, ACH disbursements, and virtual cards for marketplace sellers." />
            </div>
            <div className="md:col-span-2">
              <Button>Submit request</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
