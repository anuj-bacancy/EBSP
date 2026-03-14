import { Card, CardContent } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { requireSession } from "@/lib/auth/session";
import { listAuditLogs } from "@/lib/data/app";

export default async function AuditLogsPage() {
  await requireSession();
  const logs = await listAuditLogs();

  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Audit" title="Immutable-style audit logs" description="Actor, action, entity reference, and before/after summaries are surfaced to support compliance walkthroughs and governance reviews." />
      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="grid gap-3 p-6 md:grid-cols-[0.9fr_1fr_1fr_auto] md:items-center">
              <div>
                <p className="font-medium">{log.action}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{log.actor}</p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{log.entityType} / {log.entityId}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{log.beforeSummary} → {log.afterSummary}</p>
              <p className="text-sm text-[var(--muted-foreground)]">{log.createdAt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
