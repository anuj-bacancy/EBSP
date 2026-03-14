import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { listTransactions } from "@/lib/data/app";

export async function GET() {
  try {
    const session = await requireSession();
    const transactions = await listTransactions(session);
    const header = [
      "id",
      "partner_id",
      "account_id",
      "created_at",
      "amount_cents",
      "status",
      "direction",
      "rail",
      "description",
      "merchant",
      "location",
      "mcc",
      "risk_score",
      "risk_action",
    ];

    const rows = transactions.map((item) =>
      [
        item.id,
        item.partnerId,
        item.accountId,
        item.createdAt,
        item.amountCents,
        item.status,
        item.direction,
        item.rail,
        item.description,
        item.merchant,
        item.location,
        item.mcc,
        item.riskScore,
        item.riskAction,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );

    return new NextResponse([header.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="transactions.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to export transactions" }, { status: 401 });
  }
}
