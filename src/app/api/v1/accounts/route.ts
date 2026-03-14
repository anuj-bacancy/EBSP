import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { createAccountFlow } from "@/lib/banking/service";

const schema = z.object({
  partnerId: z.string().min(1),
  endUserId: z.string().min(1),
  type: z.enum(["checking", "savings", "business_checking"]),
  nickname: z.string().min(2),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    const auth = await authenticateRequestWithTenant(request, parsed.data.partnerId);
    const result = await createAccountFlow({
      partnerId: auth.partnerId ?? parsed.data.partnerId,
      endUserId: parsed.data.endUserId,
      type: parsed.data.type,
      nickname: parsed.data.nickname,
      actorProfileId: auth.actorProfileId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account" },
      { status: 401 },
    );
  }
}
