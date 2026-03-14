// @ts-nocheck
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadKycDocument as storeKycDocument } from "@/lib/storage/kyc";

type KycDecision = "pass" | "fail" | "review";

function pickDecision(seed: string): KycDecision {
  const value = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 10;

  if (value >= 8) {
    return "fail";
  }

  if (value >= 5) {
    return "review";
  }

  return "pass";
}

export function simulateKycDecision(input: {
  legalName: string;
  email: string;
  maskedSsn: string;
  address: string;
}) {
  const decision = pickDecision(`${input.legalName}:${input.email}:${input.maskedSsn}:${input.address}`);
  const ofacFlag = /sanction|blocked|watch/i.test(input.legalName);
  const pepFlag = /minister|senator|ambassador/i.test(input.legalName);
  const reasons =
    decision === "pass"
      ? ["identity_match", "watchlist_clear"]
      : decision === "review"
        ? ["address_review", "document_quality_check"]
        : ["watchlist_match", "identity_mismatch"];

  return {
    decision,
    ofacFlag,
    pepFlag,
    reasons,
    status:
      decision === "pass"
        ? ("approved" as const)
        : decision === "review"
          ? ("under_review" as const)
          : ("rejected" as const),
  };
}

export async function upsertKycCase(input: {
  partnerId: string;
  endUserId: string;
  legalName: string;
  email: string;
  maskedSsn: string;
  address: string;
  actorProfileId: string | null;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const result = simulateKycDecision(input);
  const { data: existing } = await admin
    .from("kyc_cases")
    .select("id")
    .eq("partner_id", input.partnerId)
    .eq("end_user_id", input.endUserId)
    .maybeSingle();

  const payload = {
    partner_id: input.partnerId,
    end_user_id: input.endUserId,
    status: result.status,
    provider_decision: result.decision,
    ofac_flag: result.ofacFlag,
    pep_flag: result.pepFlag,
    reasons: result.reasons,
    notes: result.decision === "pass" ? "Approved by sandbox KYC engine" : "Requires analyst review",
    metadata: {
      sandbox: true,
    },
    created_by: input.actorProfileId,
    updated_at: new Date().toISOString(),
  };

  const query = existing
    ? admin.from("kyc_cases").update(payload).eq("id", existing.id).select("*").single()
    : admin.from("kyc_cases").insert(payload).select("*").single();

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to persist KYC case");
  }

  await admin
    .from("end_users")
    .update({
      kyc_status: data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.endUserId)
    .eq("partner_id", input.partnerId);

  return data;
}

export async function uploadKycDocument(input: {
  partnerId: string;
  endUserId: string;
  documentType: string;
  fileName: string;
  fileContent: ArrayBuffer;
  contentType: string;
}) {
  return storeKycDocument(input);
}
