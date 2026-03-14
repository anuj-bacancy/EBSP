import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { inviteTeamMemberAction, removeMembershipAction, updateMembershipRoleAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listMemberships } from "@/lib/data/app";

export default async function TeamPage() {
  const session = await requireSession();
  const team = await listMemberships(session);
  const partnerId = session.currentPartnerId ?? session.memberships[0]?.partner_id ?? "";

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Access" title="Team and roles" description="Tenant-aware membership data powers role-based access for platform admins, partner operators, developers, and compliance officers." />
      {partnerId ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Invite team member</h3>
            <form action={inviteTeamMemberAction} className="grid gap-4 md:grid-cols-2">
              <input name="partnerId" type="hidden" value={partnerId} />
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" placeholder="Taylor Rivers" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="taylor@partner.example" />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue="Operations" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue="partner_ops" />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Invite member</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {team.map((entry) => (
          <Card key={entry.membership.id}>
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">{entry.profile?.fullName}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{entry.profile?.email}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-400)]">{entry.membership.role.replaceAll("_", " ")}</p>
              <form action={updateMembershipRoleAction} className="flex flex-wrap items-end gap-3">
                <input name="membershipId" type="hidden" value={entry.membership.id} />
                <input name="partnerId" type="hidden" value={entry.membership.partnerId} />
                <div className="min-w-52">
                  <Label htmlFor={`role-${entry.membership.id}`}>Role</Label>
                  <Input id={`role-${entry.membership.id}`} name="role" defaultValue={entry.membership.role} />
                </div>
                <Button type="submit" variant="outline">
                  Update role
                </Button>
              </form>
              <form action={removeMembershipAction}>
                <input name="membershipId" type="hidden" value={entry.membership.id} />
                <input name="partnerId" type="hidden" value={entry.membership.partnerId} />
                <Button type="submit" variant="ghost">
                  Remove access
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
