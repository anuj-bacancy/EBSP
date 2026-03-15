import { FlaskConical } from "lucide-react";

import { env } from "@/lib/config/env";

export function ModeBanner() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-500)]/20 bg-[var(--brand-500)]/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-400)]">
      <FlaskConical className="h-4 w-4" />
      {env.demoMode ? "Sandbox mode" : "Live workspace"}
    </div>
  );
}
