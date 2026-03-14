import { LogOut, Search } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ModeBanner } from "@/components/layout/mode-banner";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";
import type { AppSession } from "@/lib/auth/session";

export function PlatformTopbar({ session, notificationCount }: { session: AppSession; notificationCount: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--muted-foreground)]">
        <Search className="h-4 w-4" />
        Search accounts, transfers, alerts, or docs
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ModeBanner />
        <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
          {session.email}
        </div>
        <div className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted-foreground)]">
          {notificationCount} unread notifications
        </div>
        <ThemeToggle />
        <form action={signOutAction}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
