import Link from "next/link";
import { Bell, Building2, CreditCard, FileClock, Landmark, LayoutDashboard, Radar, Settings, Shield, SquareTerminal, Wallet } from "lucide-react";

import type { AppSession } from "@/lib/auth/session";

const primaryLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/partners", label: "Partner Mgmt", icon: Building2 },
  { href: "/team", label: "Team", icon: Shield },
  { href: "/end-users", label: "End Users", icon: Wallet },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/transactions", label: "Transactions", icon: SquareTerminal },
  { href: "/transfers", label: "Transfers", icon: FileClock },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/kyc", label: "KYC", icon: Shield },
  { href: "/compliance", label: "Compliance", icon: Shield },
  { href: "/fraud", label: "Fraud", icon: Radar },
  { href: "/webhooks", label: "Webhooks", icon: SquareTerminal },
  { href: "/api-keys", label: "API Keys", icon: SquareTerminal },
  { href: "/sandbox", label: "Sandbox", icon: SquareTerminal },
  { href: "/analytics", label: "Analytics", icon: LayoutDashboard },
  { href: "/billing", label: "Billing", icon: Wallet },
  { href: "/statements", label: "Statements", icon: FileClock },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/audit-logs", label: "Audit Logs", icon: FileClock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function PlatformSidebar({ session }: { session: AppSession }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-[var(--border)] bg-[var(--panel)]/70 px-5 py-6 xl:block">
      <div className="mb-8">
        <p className="font-display text-xl font-semibold">Northstar BaaS</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{session.profile.full_name}</p>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-400)]">{session.role.replaceAll("_", " ")}</p>
      </div>
      <nav className="space-y-1">
        {primaryLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--muted-foreground)] transition hover:bg-white/6 hover:text-[var(--foreground)]"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
