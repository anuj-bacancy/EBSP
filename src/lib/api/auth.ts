// @ts-nocheck
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAppSession, hashApiKey } from "@/lib/auth/session";

export async function authenticateRequestWithTenant(request: Request, partnerId?: string | null) {
  const session = await getAppSession();

  if (session) {
    if (partnerId && session.role !== "platform_admin" && session.role !== "compliance_admin") {
      const allowed = session.memberships.some((membership) => membership.partner_id === partnerId);
      if (!allowed) {
        throw new Error("Partner access denied");
      }
    }

    return {
      mode: "session" as const,
      partnerId: partnerId ?? session.currentPartnerId,
      actorProfileId: session.profile.id,
      actorName: session.profile.full_name,
      session,
    };
  }

  const headerValue = request.headers.get("x-api-key") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!headerValue) {
    throw new Error("Missing authentication");
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const { data: apiKey } = await admin
    .from("api_keys")
    .select("*")
    .eq("key_hash", hashApiKey(headerValue))
    .is("revoked_at", null)
    .maybeSingle();

  if (!apiKey) {
    throw new Error("Invalid API key");
  }

  if (partnerId && apiKey.partner_id !== partnerId) {
    throw new Error("Partner access denied");
  }

  return {
    mode: "api_key" as const,
    partnerId: apiKey.partner_id,
    actorProfileId: null,
    actorName: apiKey.name,
    apiKey,
  };
}
