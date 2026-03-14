import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toggleNotificationReadAction } from "@/lib/actions/platform";
import { requireSession } from "@/lib/auth/session";
import { listNotifications } from "@/lib/data/app";

export default async function NotificationsPage() {
  const session = await requireSession();
  const notifications = await listNotifications(session);

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Inbox" title="Notifications center" description="KYC decisions, webhook failures, card status changes, transfer failures, and fraud alerts are aggregated into a lightweight in-app center." />
      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{notification.body}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--brand-400)]">
                  {notification.type} • {notification.read ? "read" : "unread"}
                </p>
              </div>
              <form action={toggleNotificationReadAction}>
                <input name="notificationId" type="hidden" value={notification.id} />
                <input name="partnerId" type="hidden" value={notification.partnerId} />
                <input name="isRead" type="hidden" value={notification.read ? "false" : "true"} />
                <Button type="submit" size="sm" variant="outline">
                  Mark as {notification.read ? "unread" : "read"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
