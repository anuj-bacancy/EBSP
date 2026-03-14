import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { createEndUserAction, updateEndUserAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listEndUsers } from "@/lib/data/app";

export default async function EndUsersPage() {
  const session = await requireSession();
  const endUsers = await listEndUsers(session);
  const partnerId = session.currentPartnerId ?? session.memberships[0]?.partner_id ?? "";

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Customers" title="End-user management" description="Partner operators can manage account holders, track KYC status, inspect risk flags, and review key lifecycle metadata." />
      {partnerId ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Create end user</h3>
            <form action={createEndUserAction} className="grid gap-4 md:grid-cols-2">
              <input name="partnerId" type="hidden" value={partnerId} />
              <div>
                <Label htmlFor="legalName">Legal name</Label>
                <Input id="legalName" name="legalName" placeholder="Dana Cole" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="dana@example.com" />
              </div>
              <div>
                <Label htmlFor="dob">DOB</Label>
                <Input id="dob" name="dob" type="date" />
              </div>
              <div>
                <Label htmlFor="maskedSsn">Masked SSN</Label>
                <Input id="maskedSsn" name="maskedSsn" defaultValue="***-**-0000" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="+1 555 010 1000" />
              </div>
              <div>
                <Label htmlFor="addressLine1">Address line 1</Label>
                <Input id="addressLine1" name="addressLine1" placeholder="100 Market St" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="San Francisco" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" placeholder="CA" />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input id="postalCode" name="postalCode" placeholder="94105" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Create end user</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {endUsers.map((endUser) => (
          <Card key={endUser.id}>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{endUser.legalName}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{endUser.email}</p>
                </div>
                <StatusBadge status={endUser.kycStatus} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">DOB</p>
                  <p>{endUser.dob}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Masked SSN</p>
                  <p>{endUser.maskedSsn}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Risk flags</p>
                <p className="text-sm text-[var(--muted-foreground)]">{endUser.riskFlags.join(", ") || "No active flags"}</p>
              </div>
              <form action={updateEndUserAction} className="grid gap-3 border-t border-[var(--border)] pt-4">
                <input name="partnerId" type="hidden" value={endUser.partnerId} />
                <input name="endUserId" type="hidden" value={endUser.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label htmlFor={`legal-${endUser.id}`}>Legal name</Label>
                    <Input id={`legal-${endUser.id}`} name="legalName" defaultValue={endUser.legalName} />
                  </div>
                  <div>
                    <Label htmlFor={`email-${endUser.id}`}>Email</Label>
                    <Input id={`email-${endUser.id}`} name="email" defaultValue={endUser.email} />
                  </div>
                  <div>
                    <Label htmlFor={`phone-${endUser.id}`}>Phone</Label>
                    <Input id={`phone-${endUser.id}`} name="phone" defaultValue={endUser.phone} />
                  </div>
                  <div>
                    <Label htmlFor={`flags-${endUser.id}`}>Risk flags</Label>
                    <Input id={`flags-${endUser.id}`} name="riskFlags" defaultValue={endUser.riskFlags.join(", ")} />
                  </div>
                </div>
                <Button type="submit" variant="outline">
                  Save end user
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
