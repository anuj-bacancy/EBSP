// @ts-nocheck
import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertKycCase } from "@/lib/kyc/provider";

const schema = z.object({
  partnerId: z.string().uuid(),
  endUserId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const auth = await authenticateRequestWithTenant(request, parsed.data.partnerId);
    const admin = createSupabaseAdminClient();

    if (!admin) {
      return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
    }

    const { data: endUser } = await admin
      .from("end_users")
      .select("*")
      .eq("id", parsed.data.endUserId)
      .eq("partner_id", parsed.data.partnerId)
      .maybeSingle();

    if (!endUser) {
      return NextResponse.json({ error: "End user not found" }, { status: 404 });
    }

    const result = await upsertKycCase({
      partnerId: parsed.data.partnerId,
      endUserId: parsed.data.endUserId,
      legalName: endUser.legal_name,
      email: endUser.email,
      maskedSsn: endUser.masked_ssn,
      address: JSON.stringify(endUser.address),
      actorProfileId: auth.actorProfileId,
    });

    return NextResponse.json({ kycCase: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run KYC";
    const status = /denied|authentication|invalid api key|missing authentication/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
