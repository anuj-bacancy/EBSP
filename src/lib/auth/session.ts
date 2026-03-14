// @ts-nocheck
import crypto from "node:crypto";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/domain";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MembershipRow = Database["public"]["Tables"]["partner_memberships"]["Row"];

export interface AppSession {
  userId: string;
  email: string;
  profile: ProfileRow;
  memberships: MembershipRow[];
  currentPartnerId: string | null;
  role: AppRole;
}

export async function getAppSession(): Promise<AppSession | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { data: memberships } = await supabase
    .from("partner_memberships")
    .select("*")
    .eq("profile_id", profile.id);

  const requestHeaders = await headers();
  const partnerHeader = requestHeaders.get("x-partner-id");
  const currentPartnerId =
    partnerHeader && memberships?.some((membership) => membership.partner_id === partnerHeader)
      ? partnerHeader
      : memberships?.[0]?.partner_id ?? null;

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    memberships: memberships ?? [],
    currentPartnerId,
    role: profile.role,
  };
}

export const getSession = getAppSession;

export async function requireSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}
