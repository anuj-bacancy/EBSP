// @ts-nocheck
"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signUpSchema = z.object({
  fullName: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

async function ensureWorkspaceForUser(args: {
  authUserId: string;
  email: string;
  fullName: string;
  company: string;
}) {
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return;
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("auth_user_id", args.authUserId)
    .maybeSingle();

  let profileId = existingProfile?.id ?? null;

  if (!profileId) {
    const { data: insertedProfile } = await admin
      .from("profiles")
      .insert({
        auth_user_id: args.authUserId,
        email: args.email,
        full_name: args.fullName,
        role: "partner_admin",
        title: "Founder",
      })
      .select("id")
      .single();

    profileId = insertedProfile.id;
  }

  const slugBase = slugify(args.company);
  const slug = `${slugBase}-${args.authUserId.slice(0, 6)}`;

  const { data: partner } = await admin
    .from("partners")
    .insert({
      slug,
      name: args.company,
      status: "active",
      environment_mode: "sandbox",
      branding: {
        primaryColor: "#0f766e",
        accentColor: "#f97316",
        logoText: args.company,
      },
      webhook_config: {
        endpoint: null,
      },
      rate_limit_rpm: 600,
    })
    .select("id")
    .single();

  await admin.from("partner_memberships").insert({
    partner_id: partner.id,
    profile_id: profileId,
    role: "partner_admin",
  });

  await admin.from("fee_schedules").insert({
    partner_id: partner.id,
    subscription_tier: "starter",
    ach_debit_fee_cents: 35,
    ach_credit_fee_cents: 25,
    card_issuance_fee_cents: 150,
    webhook_event_fee_cents: 3,
    revenue_share_bps: 80,
  });

  await admin.from("subscriptions").insert({
    partner_id: partner.id,
    tier: "starter",
    status: "trialing",
    monthly_fee_cents: 49900,
  });
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/sign-in");
}

export async function signInAction(_: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid credentials",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase environment variables are not configured.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  redirect("/dashboard");
}

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password") ?? "ChangeMe123!",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid sign up payload",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase environment variables are not configured.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        title: "Founder",
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  if (data.user) {
    await ensureWorkspaceForUser({
      authUserId: data.user.id,
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      company: parsed.data.company,
    });
  }

  redirect("/dashboard");
}

export async function forgotPasswordAction(_: unknown, formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid email.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      success: false,
      message: "Supabase environment variables are not configured.",
    };
  }

  const originHeaders = await headers();
  const origin = originHeaders.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/sign-in`,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Password reset link sent.",
  };
}
