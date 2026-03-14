import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateRequestWithTenant } from "@/lib/api/auth";
import { uploadKycDocument } from "@/lib/kyc/provider";

const metadataSchema = z.object({
  partnerId: z.string().uuid(),
  endUserId: z.string().uuid(),
  documentType: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const parsed = metadataSchema.safeParse({
      partnerId: formData.get("partnerId"),
      endUserId: formData.get("endUserId"),
      documentType: formData.get("documentType"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Document file is required" }, { status: 422 });
    }

    await authenticateRequestWithTenant(request, parsed.data.partnerId);

    const result = await uploadKycDocument({
      partnerId: parsed.data.partnerId,
      endUserId: parsed.data.endUserId,
      documentType: parsed.data.documentType,
      fileName: file.name,
      fileContent: await file.arrayBuffer(),
      contentType: file.type || "application/octet-stream",
    });

    return NextResponse.json({ document: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload document";
    const status = /denied|authentication|invalid api key|missing authentication/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
