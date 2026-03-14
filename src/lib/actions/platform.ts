// @ts-nocheck
"use server";

import crypto from "node:crypto";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/access";
import { createApiKeyFlow, createWebhookFlow } from "@/lib/banking/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole } from "@/types/domain";

async function requireAdminForPartner(partnerId?: string | null) {
  const session = await requireRole(["platform_admin", "compliance_admin", "partner_admin", "partner_ops"]);
  const isPlatform = session.role === "platform_admin" || session.role === "compliance_admin";
  const resolvedPartnerId = partnerId ?? session.currentPartnerId;

  if (!resolvedPartnerId) {
    throw new Error("No partner selected");
  }

  if (!isPlatform && !session.memberships.some((membership) => membership.partner_id === resolvedPartnerId)) {
    throw new Error("Partner access denied");
  }

  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  return { admin, session, partnerId: resolvedPartnerId };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function createPartnerAction(formData: FormData) {
  await requireRole(["platform_admin"]);
  const admin = createSupabaseAdminClient();

  if (!admin) {
    throw new Error("Supabase service role is not configured");
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? slugify(name)).trim();

  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }

  await admin.from("partners").insert({
    name,
    slug,
    status: "active",
    environment_mode: "sandbox",
    branding: {
      primaryColor: String(formData.get("primaryColor") ?? "#0f766e"),
      accentColor: String(formData.get("accentColor") ?? "#f97316"),
      logoText: name,
    },
    webhook_config: {
      endpoint: String(formData.get("webhookUrl") ?? ""),
    },
    rate_limit_rpm: Number(formData.get("rateLimitRpm") ?? 600),
  });

  revalidatePath("/partners");
  revalidatePath("/settings");
}

export async function updatePartnerAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin
    .from("partners")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      status: String(formData.get("status") ?? "active"),
      environment_mode: String(formData.get("environmentMode") ?? "sandbox"),
      branding: {
        primaryColor: String(formData.get("primaryColor") ?? "#0f766e"),
        accentColor: String(formData.get("accentColor") ?? "#f97316"),
        logoText: String(formData.get("logoText") ?? ""),
      },
      webhook_config: {
        endpoint: String(formData.get("webhookUrl") ?? ""),
      },
      rate_limit_rpm: Number(formData.get("rateLimitRpm") ?? 600),
      updated_at: new Date().toISOString(),
    })
    .eq("id", partnerId);

  revalidatePath("/partners");
  revalidatePath("/settings");
}

export async function inviteTeamMemberAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const role = String(formData.get("role") ?? "partner_ops") as AppRole;
  const { admin } = await requireAdminForPartner(partnerId);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !fullName) {
    throw new Error("Full name and email are required");
  }

  let profileId: string | null = null;
  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  profileId = existing?.id ?? null;

  if (!profileId) {
    const { data: created, error } = await admin
      .from("profiles")
      .insert({
        email,
        full_name: fullName,
        role,
        title: String(formData.get("title") ?? "Team Member"),
      })
      .select("id")
      .single();

    if (error || !created) {
      throw new Error(error?.message ?? "Unable to create profile");
    }
    profileId = created.id;
  }

  await admin.from("partner_memberships").upsert({
    partner_id: partnerId,
    profile_id: profileId,
    role,
  });

  revalidatePath("/team");
}

export async function updateMembershipRoleAction(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  const role = String(formData.get("role") ?? "partner_ops") as AppRole;
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.from("partner_memberships").update({ role }).eq("id", membershipId);
  revalidatePath("/team");
}

export async function removeMembershipAction(formData: FormData) {
  const membershipId = String(formData.get("membershipId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.from("partner_memberships").delete().eq("id", membershipId);
  revalidatePath("/team");
}

export async function createEndUserAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const { admin, session } = await requireAdminForPartner(partnerId);

  await admin.from("end_users").insert({
    partner_id: partnerId,
    legal_name: String(formData.get("legalName") ?? "").trim(),
    dob: String(formData.get("dob") ?? ""),
    masked_ssn: String(formData.get("maskedSsn") ?? "***-**-0000"),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: {
      line1: String(formData.get("addressLine1") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
    },
    kyc_status: "pending",
    risk_flags: [],
    created_by: session.profile.id,
  });

  revalidatePath("/end-users");
  revalidatePath("/kyc");
}

export async function updateEndUserAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const endUserId = String(formData.get("endUserId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin
    .from("end_users")
    .update({
      legal_name: String(formData.get("legalName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      phone: String(formData.get("phone") ?? "").trim(),
      risk_flags: String(formData.get("riskFlags") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      updated_at: new Date().toISOString(),
    })
    .eq("id", endUserId)
    .eq("partner_id", partnerId);

  revalidatePath("/end-users");
}

export async function createWebhookAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  await requireAdminForPartner(partnerId);

  await createWebhookFlow({
    partnerId,
    endpoint: String(formData.get("endpoint") ?? ""),
    subscribedEvents: String(formData.get("subscribedEvents") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });

  revalidatePath("/webhooks");
}

export async function updateWebhookAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const webhookId = String(formData.get("webhookId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin
    .from("webhooks")
    .update({
      endpoint: String(formData.get("endpoint") ?? ""),
      subscribed_events: String(formData.get("subscribedEvents") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      status: String(formData.get("status") ?? "healthy"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", webhookId)
    .eq("partner_id", partnerId);

  revalidatePath("/webhooks");
}

export async function deleteWebhookAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const webhookId = String(formData.get("webhookId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.from("webhooks").delete().eq("id", webhookId).eq("partner_id", partnerId);
  revalidatePath("/webhooks");
}

export async function createApiKeyAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  await requireAdminForPartner(partnerId);

  await createApiKeyFlow({
    partnerId,
    name: String(formData.get("name") ?? ""),
    scopes: String(formData.get("scopes") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });

  revalidatePath("/api-keys");
}

export async function revokeApiKeyAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const apiKeyId = String(formData.get("apiKeyId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", apiKeyId).eq("partner_id", partnerId);
  revalidatePath("/api-keys");
}

export async function rotateApiKeyAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const apiKeyId = String(formData.get("apiKeyId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", apiKeyId).eq("partner_id", partnerId);
  await createApiKeyFlow({
    partnerId,
    name: `${String(formData.get("name") ?? "Rotated key")} ${crypto.randomInt(100, 999)}`,
    scopes: String(formData.get("scopes") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  });

  revalidatePath("/api-keys");
}

export async function resolveFraudAlertAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const alertId = String(formData.get("alertId") ?? "");
  const { admin, session } = await requireAdminForPartner(partnerId);

  await admin.from("fraud_alerts").update({ status: "resolved" }).eq("id", alertId).eq("partner_id", partnerId);
  await admin.from("audit_logs").insert({
    partner_id: partnerId,
    actor: session.profile.full_name,
    action: "fraud_alert.resolved",
    entity_type: "fraud_alert",
    entity_id: alertId,
    after_summary: "status=resolved",
  });
  revalidatePath("/fraud");
  revalidatePath("/audit-logs");
}

export async function resolveComplianceCaseAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const caseId = String(formData.get("caseId") ?? "");
  const { admin, session } = await requireAdminForPartner(partnerId);

  await admin
    .from("compliance_cases")
    .update({
      status: String(formData.get("status") ?? "closed"),
      assigned_to: session.profile.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("partner_id", partnerId);

  await admin.from("audit_logs").insert({
    partner_id: partnerId,
    actor: session.profile.full_name,
    action: "compliance_case.updated",
    entity_type: "compliance_case",
    entity_id: caseId,
    after_summary: `status=${String(formData.get("status") ?? "closed")}`,
  });

  revalidatePath("/compliance");
  revalidatePath("/audit-logs");
}

export async function toggleNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  const { admin } = await requireAdminForPartner(partnerId);

  await admin.rpc("mark_notification_read", {
    p_notification_id: notificationId,
    p_is_read: String(formData.get("isRead") ?? "true") === "true",
  });

  revalidatePath("/notifications");
}

export async function updateKycCaseAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  const caseId = String(formData.get("caseId") ?? "");
  const { admin, session } = await requireAdminForPartner(partnerId);

  await admin
    .from("kyc_cases")
    .update({
      status: String(formData.get("status") ?? "approved"),
      notes: String(formData.get("notes") ?? ""),
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId)
    .eq("partner_id", partnerId);

  await admin.from("audit_logs").insert({
    partner_id: partnerId,
    actor: session.profile.full_name,
    action: "kyc_case.updated",
    entity_type: "kyc_case",
    entity_id: caseId,
    after_summary: `status=${String(formData.get("status") ?? "approved")}`,
  });

  revalidatePath("/kyc");
  revalidatePath("/audit-logs");
}
