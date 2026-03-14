import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth/session";
import { listStatements } from "@/lib/data/app";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const statements = await listStatements(session);
    const statement = statements.find((candidate) => candidate.id === id);

    if (!statement) {
      return NextResponse.json({ error: "Statement not found" }, { status: 404 });
    }

    const content = [
      `Northstar BaaS Statement ${statement.id}`,
      `Month: ${statement.month}`,
      `Partner: ${statement.partnerId}`,
      `Account: ${statement.accountId}`,
      `Opening balance: ${statement.openingBalanceCents}`,
      `Closing balance: ${statement.closingBalanceCents}`,
      `Transaction count: ${statement.transactionCount}`,
    ].join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${statement.id}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to download statement" }, { status: 401 });
  }
}
