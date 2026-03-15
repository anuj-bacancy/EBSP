import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[color:color-mix(in_oklab,var(--panel-strong)_70%,white_8%)]", className)} />;
}
