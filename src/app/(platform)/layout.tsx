import type { ReactNode } from "react";

import { PlatformSidebar } from "@/components/layout/platform-sidebar";
import { PlatformTopbar } from "@/components/layout/platform-topbar";
import { requireSession } from "@/lib/auth/session";
import { listNotifications } from "@/lib/data/app";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const notifications = await listNotifications(session);
  const notificationCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="min-h-screen xl:flex">
      <PlatformSidebar session={session} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <PlatformTopbar notificationCount={notificationCount} session={session} />
          {children}
        </div>
      </main>
    </div>
  );
}
