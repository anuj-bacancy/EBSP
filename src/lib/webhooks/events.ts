// @ts-nocheck
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signWebhookPayload } from "@/lib/webhooks/signature";

export async function emitWebhookEvents(partnerId: string, eventTypes: string[], payload: Record<string, unknown>) {
  const admin = createSupabaseAdminClient();

  if (!admin || !eventTypes.length) {
    return [];
  }

  const { data: webhooks } = await admin
    .from("webhooks")
    .select("*")
    .eq("partner_id", partnerId)
    .contains("subscribed_events", eventTypes);

  if (!webhooks?.length) {
    return [];
  }

  const deliveries = webhooks.flatMap((webhook) =>
    eventTypes.map((eventType) => ({
      partner_id: partnerId,
      webhook_id: webhook.id,
      event_type: eventType,
      attempt_count: 1,
      last_response_code: 202,
      last_attempt_at: new Date().toISOString(),
      status: "delivered" as const,
      metadata: {
        payload,
        signature: signWebhookPayload(JSON.stringify(payload), webhook.secret_hash),
      },
    })),
  );

  const { data } = await admin.from("webhook_deliveries").insert(deliveries).select("*");
  return data ?? [];
}
