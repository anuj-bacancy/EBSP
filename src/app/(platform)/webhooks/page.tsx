import { WebhookReplayButton } from "@/features/developer/webhook-replay-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionTitle } from "@/components/ui/section-title";
import { StatusBadge } from "@/components/ui/badge";
import { createWebhookAction, deleteWebhookAction, updateWebhookAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listWebhookDeliveries, listWebhooks } from "@/lib/data/app";

export default async function WebhooksPage() {
  const session = await requireSession();
  const [webhooks, webhookDeliveries] = await Promise.all([listWebhooks(session), listWebhookDeliveries(session)]);
  const partnerId = session.currentPartnerId ?? session.memberships[0]?.partner_id ?? "";

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Events" title="Webhooks and delivery logs" description="View registered endpoints, subscribed events, failure metadata, and replay webhook attempts using HMAC signatures." />
      {partnerId ? (
        <Card>
          <CardHeader>
            <CardTitle>Register endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createWebhookAction} className="grid gap-4 md:grid-cols-[1.2fr_1fr_auto]">
              <input name="partnerId" type="hidden" value={partnerId} />
              <div>
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input id="endpoint" name="endpoint" placeholder="https://partner.example/hooks/northstar" />
              </div>
              <div>
                <Label htmlFor="subscribedEvents">Subscribed events</Label>
                <Input id="subscribedEvents" name="subscribedEvents" defaultValue="account.created,transfer.created,transfer.settled,card.created" />
              </div>
              <div className="self-end">
                <Button type="submit">Create webhook</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configured endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium">{webhook.endpoint}</p>
                  <StatusBadge status={webhook.status} />
                </div>
                <form action={updateWebhookAction} className="grid gap-3">
                  <input name="partnerId" type="hidden" value={webhook.partnerId} />
                  <input name="webhookId" type="hidden" value={webhook.id} />
                  <div>
                    <Label htmlFor={`endpoint-${webhook.id}`}>Endpoint</Label>
                    <Input id={`endpoint-${webhook.id}`} name="endpoint" defaultValue={webhook.endpoint} />
                  </div>
                  <div>
                    <Label htmlFor={`events-${webhook.id}`}>Events</Label>
                    <Input id={`events-${webhook.id}`} name="subscribedEvents" defaultValue={webhook.subscribedEvents.join(", ")} />
                  </div>
                  <div>
                    <Label htmlFor={`status-${webhook.id}`}>Status</Label>
                    <Input id={`status-${webhook.id}`} name="status" defaultValue={webhook.status} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" variant="outline">
                      Save webhook
                    </Button>
                  </div>
                </form>
                <form action={deleteWebhookAction} className="mt-3">
                  <input name="partnerId" type="hidden" value={webhook.partnerId} />
                  <input name="webhookId" type="hidden" value={webhook.id} />
                  <Button type="submit" size="sm" variant="ghost">
                    Delete
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Delivery history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {webhookDeliveries.map((delivery) => (
              <div key={delivery.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{delivery.eventType}</p>
                  <WebhookReplayButton deliveryId={delivery.id} eventType={delivery.eventType} />
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Attempts {delivery.attemptCount} • Last code {delivery.lastResponseCode} • {delivery.status}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
