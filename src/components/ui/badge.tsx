import { cva, type VariantProps } from "class-variance-authority";

import { cn, titleCase } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", {
  variants: {
    tone: {
      neutral: "bg-white/10 text-[var(--foreground)]",
      success: "bg-emerald-500/15 text-emerald-300",
      warning: "bg-amber-500/15 text-amber-300",
      danger: "bg-rose-500/15 text-rose-300",
      info: "bg-sky-500/15 text-sky-300",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export function Badge({
  children,
  className,
  tone,
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status.includes("active") || status.includes("approved") || status.includes("settled")
      ? "success"
      : status.includes("pending") || status.includes("review") || status.includes("submitted")
        ? "warning"
        : status.includes("failed") || status.includes("frozen") || status.includes("closed")
          ? "danger"
          : "info";

  return <Badge tone={tone}>{titleCase(status)}</Badge>;
}
