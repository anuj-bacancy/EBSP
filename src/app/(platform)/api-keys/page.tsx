import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { createApiKeyAction, revokeApiKeyAction, rotateApiKeyAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listApiKeys } from "@/lib/data/app";

export default async function ApiKeysPage() {
  const session = await requireSession();
  const apiKeys = await listApiKeys(session);
  const partnerId = session.currentPartnerId ?? session.memberships[0]?.partner_id ?? "";

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Developer Access" title="API keys" description="Manage sandbox key prefixes, scopes, and last usage information. In production these records would store only hashed material plus rotation metadata." />
      {partnerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Create API key</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createApiKeyAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <input name="partnerId" type="hidden" value={partnerId} />
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Sandbox CLI" />
              </div>
              <div>
                <Label htmlFor="scopes">Scopes</Label>
                <Input id="scopes" name="scopes" defaultValue="accounts:write,transfers:write,cards:write" />
              </div>
              <div className="self-end">
                <Button type="submit">Create key</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-4">
        {apiKeys.map((key) => (
          <Card key={key.id}>
            <CardHeader>
              <CardTitle>{key.name}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Prefix</p>
                <p className="mt-1 font-medium">{key.prefix}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Scopes</p>
                <p className="mt-1 text-sm">{key.scopes.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">Last used</p>
                <p className="mt-1 text-sm">{key.lastUsedAt}</p>
              </div>
              <div className="flex gap-2 md:col-span-3">
                <form action={rotateApiKeyAction}>
                  <input name="partnerId" type="hidden" value={key.partnerId} />
                  <input name="apiKeyId" type="hidden" value={key.id} />
                  <input name="name" type="hidden" value={key.name} />
                  <input name="scopes" type="hidden" value={key.scopes.join(",")} />
                  <Button type="submit" size="sm" variant="outline">
                    Rotate
                  </Button>
                </form>
                <form action={revokeApiKeyAction}>
                  <input name="partnerId" type="hidden" value={key.partnerId} />
                  <input name="apiKeyId" type="hidden" value={key.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Revoke
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
