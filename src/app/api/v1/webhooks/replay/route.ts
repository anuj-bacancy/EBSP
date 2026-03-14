// @ts-nocheck
import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signWebhookPayload } from "@/lib/webhooks/signature";

const schema = z.object({
  deliveryId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const admin = createSupabaseAdminClient();

    if (!admin) {
      return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
    }

    const { data: delivery } = await admin
      .from("webhook_deliveries")
      .select("*")
      .eq("id", parsed.data.deliveryId)
      .maybeSingle();

    if (!delivery) {
      return NextResponse.json({ error: "Webhook delivery not found" }, { status: 404 });
    }

    await authenticateRequestWithTenant(request, delivery.partner_id);

    const { data: webhook } = await admin.from("webhooks").select("*").eq("id", delivery.webhook_id).maybeSingle();

    if (!webhook) {
      return NextResponse.json({ error: "Webhook endpoint not found" }, { status: 404 });
    }

    const payload = JSON.stringify({
      id: delivery.id,
      type: delivery.event_type,
      replayed_at: new Date().toISOString(),
      metadata: delivery.metadata,
    });
    const signature = signWebhookPayload(payload, webhook.secret_hash);

    await admin
      .from("webhook_deliveries")
      .update({
        attempt_count: delivery.attempt_count + 1,
        last_response_code: 202,
        last_attempt_at: new Date().toISOString(),
        status: "delivered",
        metadata: {
          ...(typeof delivery.metadata === "object" && delivery.metadata ? delivery.metadata : {}),
          replayed: true,
          signature,
        },
      })
      .eq("id", delivery.id);

    return NextResponse.json({
      payload,
      signature,
      attemptedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to replay webhook";
    const status = /denied|authentication|invalid api key|missing authentication/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
