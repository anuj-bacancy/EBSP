import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/config/env";
import type { Database } from "@/types/supabase";
export function createSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.serviceRoleKey) {
    return null;
  }

  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
