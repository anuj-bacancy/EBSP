// @ts-nocheck
import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { createTransferFlow } from "@/lib/banking/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  accountId: z.string().min(1),
  beneficiaryId: z.string().min(1),
  amountCents: z.number().int().positive(),
  direction: z.enum(["credit", "debit"]),
  speed: z.enum(["same_day", "next_day"]),
  idempotencyKey: z.string().min(6),
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

    const { data: account } = await admin.from("accounts").select("partner_id").eq("id", parsed.data.accountId).maybeSingle();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const auth = await authenticateRequestWithTenant(request, account.partner_id);
    const result = await createTransferFlow({
      partnerId: auth.partnerId ?? account.partner_id,
      accountId: parsed.data.accountId,
      beneficiaryId: parsed.data.beneficiaryId,
      amountCents: parsed.data.amountCents,
      direction: parsed.data.direction,
      speed: parsed.data.speed,
      idempotencyKey: parsed.data.idempotencyKey,
      actorProfileId: auth.actorProfileId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create transfer";
    const status = /denied|authentication|invalid api key|missing authentication/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
