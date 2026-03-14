import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/config/env";
import type { Database } from "@/types/supabase";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
