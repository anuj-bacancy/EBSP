import { z } from "zod";

const bool = (value: string | undefined, fallback: boolean) => {
  if (!value) {
    return fallback;
  }

  return value === "true";
};

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Northstar BaaS Cloud"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEMO_MODE: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_DEFAULT_PARTNER_SLUG: z.string().default("acme-pay"),
});

const parsedEnv = envSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_DEFAULT_PARTNER_SLUG: process.env.NEXT_PUBLIC_DEFAULT_PARTNER_SLUG,
});

export const env = {
  appName: parsedEnv.NEXT_PUBLIC_APP_NAME,
  appUrl: parsedEnv.NEXT_PUBLIC_APP_URL,
  demoMode: bool(parsedEnv.NEXT_PUBLIC_DEMO_MODE, false),
  supabaseUrl: parsedEnv.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: parsedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: parsedEnv.SUPABASE_SERVICE_ROLE_KEY ?? "",
  defaultPartnerSlug: parsedEnv.NEXT_PUBLIC_DEFAULT_PARTNER_SLUG,
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export function requireSupabaseBrowserEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
  };
}

export function requireSupabaseServerEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !env.serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabaseAnonKey: env.supabaseAnonKey,
    serviceRoleKey: env.serviceRoleKey,
  };
}
