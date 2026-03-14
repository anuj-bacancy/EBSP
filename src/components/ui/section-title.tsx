import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-400)]">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm text-[var(--muted-foreground)] md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
