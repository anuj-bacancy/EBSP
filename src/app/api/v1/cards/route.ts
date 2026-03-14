import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { issueCardFlow } from "@/lib/banking/service";

const schema = z.object({
  partnerId: z.string().min(1),
  accountId: z.string().min(1),
  cardholderName: z.string().min(2),
  dailyLimitCents: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const auth = await authenticateRequestWithTenant(request, parsed.data.partnerId);
    const result = await issueCardFlow({
      partnerId: auth.partnerId ?? parsed.data.partnerId,
      accountId: parsed.data.accountId,
      cardholderName: parsed.data.cardholderName,
      dailyLimitCents: parsed.data.dailyLimitCents,
      actorProfileId: auth.actorProfileId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to issue card";
    const status = /denied|authentication|invalid api key|missing authentication/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
