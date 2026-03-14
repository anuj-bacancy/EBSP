import { signWebhookPayload } from "@/lib/webhooks/signature";

export function createWebhookReplay(eventType: string, secretPreview: string) {
  const payload = JSON.stringify({
    id: `evt_${eventType.replaceAll(".", "_")}`,
    type: eventType,
    created_at: "2026-03-14T05:00:00Z",
  });

  return {
    payload,
    signature: signWebhookPayload(payload, secretPreview),
    attemptedAt: "2026-03-14T05:00:00Z",
  };
}
